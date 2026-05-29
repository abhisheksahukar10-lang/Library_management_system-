package com.library.service;

import com.library.model.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BorrowService {

    @Autowired private BorrowTransactionRepository transactionRepository;
    @Autowired private BookCopyRepository          bookCopyRepository;
    @Autowired private UserRepository              userRepository;
    @Autowired private FineRepository              fineRepository;
    @Autowired private EmailService                emailService;

    /** Injected lazily to break the circular dependency with PreBorrowService. */
    @Autowired @Lazy
    private PreBorrowService preBorrowService;

    @Transactional
    public BorrowTransaction borrowBook(@NonNull Long userId, @NonNull Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        long currentBorrows = transactionRepository.countByBorrowerIdAndReturned(userId, false);
        if (currentBorrows >= user.getBorrowLimit())
            throw new RuntimeException(user.getUserType() + " borrow limit reached (" + user.getBorrowLimit() + " books max).");

        if (!fineRepository.findByUserIdAndPaid(userId, false).isEmpty())
            throw new RuntimeException("Cannot borrow: you have unpaid fines. Please pay first.");

        BookCopy availableCopy = bookCopyRepository
                .findFirstByBookIdAndStatus(bookId, BookStatus.AVAILABLE)
                .orElseThrow(() -> new RuntimeException("No available copy for this book."));

        LocalDate borrowDate = LocalDate.now();
        LocalDate dueDate    = borrowDate.plusDays(user.getBorrowDurationDays());

        Book book = availableCopy.getBook();
        if (book.isRestrictedFromRemoval() && book.getInLibraryHoursLimit() > 0)
            dueDate = borrowDate;

        BorrowTransaction transaction = new BorrowTransaction(user, availableCopy, borrowDate, dueDate);
        availableCopy.setStatus(BookStatus.BORROWED);
        bookCopyRepository.save(availableCopy);
        return transactionRepository.save(transaction);
    }

    @Transactional
    public BorrowTransaction returnBook(@NonNull Long transactionId) {
        BorrowTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));

        if (transaction.isReturned())
            throw new RuntimeException("Book already returned!");

        transaction.setReturnDate(LocalDate.now());
        transaction.setReturned(true);

        BookCopy copy = transaction.getBookCopy();
        copy.setStatus(BookStatus.AVAILABLE);
        bookCopyRepository.save(copy);

        // Auto-promote next reservation in queue (if any)
        preBorrowService.promoteNextReservation(copy.getBook().getId(), copy);

        // Calculate fine if overdue
        if (transaction.isOverdue() || LocalDate.now().isAfter(transaction.getDueDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS
                    .between(transaction.getDueDate(), LocalDate.now());
            if (overdueDays > 0) {
                Fine fine = new Fine();
                fine.setTransaction(transaction);
                fine.setUser(transaction.getBorrower());
                double ratePerDay = transaction.getBorrower().getFinePerDay();
                fine.calculateFine((int) overdueDays, ratePerDay);
                fineRepository.save(fine);
                transaction.setFine(fine);

                // Send fine notification email
                try {
                    String bookTitle = transaction.getBookCopy().getBook().getTitle();
                    emailService.sendFineEmail(
                        transaction.getBorrower().getEmail(),
                        transaction.getBorrower().getName(),
                        bookTitle,
                        (int) overdueDays,
                        ratePerDay,
                        fine.getTotalAmount()
                    );
                } catch (Exception e) {
                    System.err.println("⚠️ Fine email failed: " + e.getMessage());
                }
            }
        }
        return transactionRepository.save(transaction);
    }

    public List<BorrowTransaction> getAllTransactions()                        { return transactionRepository.findAll(); }
    public List<BorrowTransaction> getUserTransactions(@NonNull Long userId)   { return transactionRepository.findByBorrowerId(userId); }
    public List<BorrowTransaction> getActiveTransactions(@NonNull Long userId) { return transactionRepository.findByBorrowerIdAndReturned(userId, false); }
    public List<BorrowTransaction> getOverdueTransactions()                    { return transactionRepository.findAllOverdue(); }
    public Optional<BorrowTransaction> getTransactionById(@NonNull Long id)    { return transactionRepository.findById(id); }
}
