package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Records every borrowing event: who borrowed which copy, when, and for how long.
 *
 * Problem statement: "Entry of all the book will be done, who borrows that
 * book and when and also duration."
 *
 * OOP CONCEPT: ASSOCIATION — links User and BookCopy (many-to-many concept
 * handled via a join entity).
 */
@Entity
@Table(name = "borrow_transactions")
@Data
@NoArgsConstructor
public class BorrowTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Who borrowed the book (Student or Faculty — polymorphism).
     * At runtime, this could be a Student or Faculty object.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User borrower;

    /**
     * Which specific physical copy was borrowed.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_copy_id", nullable = false)
    private BookCopy bookCopy;

    @Column(nullable = false)
    private LocalDate borrowDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate returnDate;   // null means not yet returned

    @Column(nullable = false)
    private boolean returned = false;

    /**
     * For restricted (in-library-only) books, this is the time borrowed in hours.
     * For regular books this is 0 (not applicable).
     */
    private int inLibraryHours = 0;

    /**
     * Fine linked to this transaction (if book was returned late).
     * OOP CONCEPT: COMPOSITION — transaction "has-a" fine.
     */
    @OneToOne(mappedBy = "transaction", cascade = CascadeType.ALL)
    private Fine fine;

    // Convenience constructor
    public BorrowTransaction(User borrower, BookCopy bookCopy,
                              LocalDate borrowDate, LocalDate dueDate) {
        this.borrower = borrower;
        this.bookCopy = bookCopy;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.returned = false;
    }

    /**
     * Check if this transaction is overdue right now.
     */
    public boolean isOverdue() {
        if (returned) return false;
        return LocalDate.now().isAfter(dueDate);
    }

    /**
     * How many days overdue (0 if not overdue).
     */
    public long getOverdueDays() {
        if (!isOverdue()) return 0;
        return java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
    }
}
