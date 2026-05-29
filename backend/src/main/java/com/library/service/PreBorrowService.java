package com.library.service;

import com.library.model.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PreBorrowService {

    @Autowired private PreBorrowRepository   preBorrowRepository;
    @Autowired private UserRepository        userRepository;
    @Autowired private BookRepository        bookRepository;
    @Autowired private BookCopyRepository    bookCopyRepository;
    @Autowired private BorrowTransactionRepository transactionRepository;
    @Autowired private FineRepository        fineRepository;

    /**
     * Place a pre-borrow reservation.
     * Fails if: book has available copies (just borrow it),
     *           user already has a pending reservation for this book,
     *           user has unpaid fines,
     *           user is at borrow limit.
     */
    @Transactional
    public PreBorrow placePreborrow(@NonNull Long userId, @NonNull Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found."));

        // Block if copies are actually available
        boolean hasAvailable = !bookCopyRepository
                .findFirstByBookIdAndStatus(bookId, BookStatus.AVAILABLE).isEmpty();
        if (hasAvailable)
            throw new RuntimeException(
                "This book has available copies — please borrow it directly instead of reserving.");

        // Block duplicate reservations
        if (preBorrowRepository.existsByUserIdAndBookIdAndStatus(userId, bookId, PreBorrow.Status.PENDING))
            throw new RuntimeException("You already have a pending reservation for this book.");

        // Block if unpaid fines
        if (!fineRepository.findByUserIdAndPaid(userId, false).isEmpty())
            throw new RuntimeException("Cannot reserve: you have unpaid fines. Please pay first.");

        // Block if at borrow limit
        long active = transactionRepository.countByBorrowerIdAndReturned(userId, false);
        if (active >= user.getBorrowLimit())
            throw new RuntimeException(
                user.getUserType() + " borrow limit reached (" + user.getBorrowLimit() + " books max).");

        int queuePos = preBorrowRepository.countPendingForBook(bookId) + 1;

        PreBorrow pb = new PreBorrow(user, book, LocalDate.now(), queuePos);
        return preBorrowRepository.save(pb);
    }

    /** Cancel a user's own reservation. */
    @Transactional
    public PreBorrow cancelPreborrow(@NonNull Long preBorrowId, @NonNull Long userId) {
        PreBorrow pb = preBorrowRepository.findById(preBorrowId)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));
        if (!pb.getUser().getId().equals(userId))
            throw new RuntimeException("You can only cancel your own reservations.");
        if (pb.getStatus() == PreBorrow.Status.FULFILLED || pb.getStatus() == PreBorrow.Status.CANCELLED)
            throw new RuntimeException("This reservation is already " + pb.getStatus().name().toLowerCase() + ".");

        pb.setStatus(PreBorrow.Status.CANCELLED);

        // If this reservation had an assigned copy (was READY), free it back
        if (pb.getAssignedCopy() != null) {
            BookCopy copy = pb.getAssignedCopy();
            copy.setStatus(BookStatus.AVAILABLE);
            bookCopyRepository.save(copy);
            pb.setAssignedCopy(null);
        }

        return preBorrowRepository.save(pb);
    }

    /**
     * Called automatically when a book is returned.
     * Marks the copy as RESERVED so no one else can borrow it,
     * but does NOT automatically pick a winner — admin decides.
     * All PENDING reservations for this book stay PENDING and
     * the copy is linked to the first-in-queue reservation as a
     * "holding" assignment so the admin can see which copy is waiting.
     */
    @Transactional
    public void promoteNextReservation(@NonNull Long bookId, @NonNull BookCopy freedCopy) {
        List<PreBorrow> pending = preBorrowRepository
                .findByBookIdAndStatusOrderByQueuePositionAsc(bookId, PreBorrow.Status.PENDING);

        if (!pending.isEmpty()) {
            // Reserve the copy so no direct borrow can claim it
            freedCopy.setStatus(BookStatus.RESERVED);
            bookCopyRepository.save(freedCopy);

            // Attach the freed copy to ALL pending reservations for this book
            // so admin can see the copy is available and waiting for approval
            for (PreBorrow pb : pending) {
                if (pb.getAssignedCopy() == null) {
                    pb.setAssignedCopy(freedCopy);
                    preBorrowRepository.save(pb);
                }
            }
        }
        // If no pending reservations, copy status stays AVAILABLE (set by BorrowService)
    }

    /**
     * Admin approves a reservation: the chosen user gets the book immediately.
     * All other PENDING reservations for the same book lose the copy assignment
     * (they stay PENDING and will be assigned the next returned copy).
     */
    @Transactional
    public BorrowTransaction adminApprove(@NonNull Long preBorrowId) {
        PreBorrow pb = preBorrowRepository.findById(preBorrowId)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));

        if (pb.getStatus() != PreBorrow.Status.PENDING)
            throw new RuntimeException("Reservation is not pending — status: " + pb.getStatus());

        BookCopy copy = pb.getAssignedCopy();
        if (copy == null)
            throw new RuntimeException("No copy is currently available for this reservation. Wait until a copy is returned.");

        User user          = pb.getUser();
        LocalDate borrowDate = LocalDate.now();
        LocalDate dueDate  = borrowDate.plusDays(user.getBorrowDurationDays());

        // Create borrow transaction
        BorrowTransaction tx = new BorrowTransaction(user, copy, borrowDate, dueDate);
        copy.setStatus(BookStatus.BORROWED);
        bookCopyRepository.save(copy);

        pb.setStatus(PreBorrow.Status.FULFILLED);
        preBorrowRepository.save(pb);

        // Clear the copy assignment from all other PENDING reservations for this book
        // so they don't reference a now-borrowed copy
        List<PreBorrow> others = preBorrowRepository
                .findByBookIdAndStatusOrderByQueuePositionAsc(pb.getBook().getId(), PreBorrow.Status.PENDING);
        for (PreBorrow other : others) {
            if (other.getAssignedCopy() != null && other.getAssignedCopy().getId().equals(copy.getId())) {
                other.setAssignedCopy(null);
                preBorrowRepository.save(other);
            }
        }

        return transactionRepository.save(tx);
    }

    /**
     * Fulfil a READY reservation — kept for backwards compatibility,
     * but with admin-approval flow the preferred path is adminApprove().
     */
    @Transactional
    public BorrowTransaction fulfil(@NonNull Long preBorrowId, @NonNull Long userId) {
        PreBorrow pb = preBorrowRepository.findById(preBorrowId)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));
        if (!pb.getUser().getId().equals(userId))
            throw new RuntimeException("You can only fulfil your own reservations.");
        if (pb.getStatus() != PreBorrow.Status.READY)
            throw new RuntimeException("Reservation is not ready yet — status: " + pb.getStatus());

        User user          = pb.getUser();
        BookCopy copy      = pb.getAssignedCopy();
        LocalDate borrowDate = LocalDate.now();
        LocalDate dueDate  = borrowDate.plusDays(user.getBorrowDurationDays());

        BorrowTransaction tx = new BorrowTransaction(user, copy, borrowDate, dueDate);
        copy.setStatus(BookStatus.BORROWED);
        bookCopyRepository.save(copy);

        pb.setStatus(PreBorrow.Status.FULFILLED);
        preBorrowRepository.save(pb);

        return transactionRepository.save(tx);
    }

    public List<PreBorrow> getUserPreborrows(@NonNull Long userId) {
        return preBorrowRepository.findByUserId(userId);
    }

    public List<PreBorrow> getUserActivePreborrows(@NonNull Long userId) {
        List<PreBorrow> pending = preBorrowRepository.findByUserIdAndStatus(userId, PreBorrow.Status.PENDING);
        List<PreBorrow> ready   = preBorrowRepository.findByUserIdAndStatus(userId, PreBorrow.Status.READY);
        pending.addAll(ready);
        return pending;
    }

    public List<PreBorrow> getAll() {
        return preBorrowRepository.findAll();
    }

    /** All PENDING reservations (for admin panel). */
    public List<PreBorrow> getAllPending() {
        return preBorrowRepository.findByStatus(PreBorrow.Status.PENDING);
    }
}
