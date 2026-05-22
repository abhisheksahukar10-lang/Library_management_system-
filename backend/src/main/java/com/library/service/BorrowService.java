package com.library.service;

import com.library.model.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Core borrowing logic.
 * OOP CONCEPT: POLYMORPHISM — uses User's abstract methods at runtime
 * to decide borrow limits and durations, without knowing if it's a
 * Student or Faculty.
 */
@Service
public class BorrowService {

    @Autowired
    private BorrowTransactionRepository transactionRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FineRepository fineRepository;

    /**
     * Borrow a book for a user.
     *
     * OOP CONCEPT: POLYMORPHISM
     * user.getBorrowLimit() and user.getBorrowDurationDays() call the
     * correct Student or Faculty implementation at runtime.
     */
    @Transactional
    public BorrowTransaction borrowBook(Long userId, Long bookId) {
        // 1. Load the user (could be Student or Faculty — polymorphism)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // 2. Check borrow limit using POLYMORPHISM
        long currentBorrows = transactionRepository
                .countByBorrowerIdAndReturned(userId, false);

        if (currentBorrows >= user.getBorrowLimit()) {
            throw new RuntimeException(
                user.getUserType() + " borrow limit reached ("
                + user.getBorrowLimit() + " books max)."
            );
        }

        // 3. Check if user has unpaid fines
        List<Fine> unpaidFines = fineRepository.findByUserIdAndPaid(userId, false);
        if (!unpaidFines.isEmpty()) {
            throw new RuntimeException("Cannot borrow: you have unpaid fines. Please pay first.");
        }

        // 4. Find an available copy
        BookCopy availableCopy = bookCopyRepository
                .findFirstByBookIdAndStatus(bookId, BookStatus.AVAILABLE)
                .orElseThrow(() -> new RuntimeException("No available copy for this book."));

        // 5. Calculate due date using POLYMORPHISM
        LocalDate borrowDate = LocalDate.now();
        LocalDate dueDate = borrowDate.plusDays(user.getBorrowDurationDays());

        // Handle restricted books: borrow for less than a day
        Book book = availableCopy.getBook();
        if (book.isRestrictedFromRemoval() && book.getInLibraryHoursLimit() > 0) {
            // For in-library use, due "date" is same day
            dueDate = borrowDate;
        }

        // 6. Create transaction
        BorrowTransaction transaction = new BorrowTransaction(
                user, availableCopy, borrowDate, dueDate
        );

        // 7. Mark copy as BORROWED
        availableCopy.setStatus(BookStatus.BORROWED);
        bookCopyRepository.save(availableCopy);

        return transactionRepository.save(transaction);
    }

    /**
     * Return a book. Calculate fine if overdue.
     */
    @Transactional
    public BorrowTransaction returnBook(Long transactionId) {
        BorrowTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));

        if (transaction.isReturned()) {
            throw new RuntimeException("Book already returned!");
        }

        // Mark as returned
        transaction.setReturnDate(LocalDate.now());
        transaction.setReturned(true);

        // Free up the copy
        BookCopy copy = transaction.getBookCopy();
        copy.setStatus(BookStatus.AVAILABLE);
        bookCopyRepository.save(copy);

        // Check if overdue — generate fine if so
        if (transaction.isOverdue() || LocalDate.now().isAfter(transaction.getDueDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS
                    .between(transaction.getDueDate(), LocalDate.now());

            if (overdueDays > 0) {
                Fine fine = new Fine();
                fine.setTransaction(transaction);
                fine.setUser(transaction.getBorrower());

                // POLYMORPHISM: fine rate depends on user type
                double ratePerDay = transaction.getBorrower().getFinePerDay();
                fine.calculateFine((int) overdueDays, ratePerDay);

                fineRepository.save(fine);
                transaction.setFine(fine);
            }
        }

        return transactionRepository.save(transaction);
    }

    public List<BorrowTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<BorrowTransaction> getUserTransactions(Long userId) {
        return transactionRepository.findByBorrowerId(userId);
    }

    public List<BorrowTransaction> getActiveTransactions(Long userId) {
        return transactionRepository.findByBorrowerIdAndReturned(userId, false);
    }

    public List<BorrowTransaction> getOverdueTransactions() {
        return transactionRepository.findAllOverdue();
    }

    public Optional<BorrowTransaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }
}
