package com.library.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

import java.time.LocalDate;

/**
 * Records every borrowing event:
 * who borrowed which copy, when, and for how long.
 *
 * OOP CONCEPT:
 * ASSOCIATION → links User and BookCopy.
 */
@Entity
@Table(name = "borrow_transactions")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BorrowTransaction {

    @Nullable
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * FIX:
     * Changed LAZY -> EAGER
     * Prevents Hibernate proxy serialization issue.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User borrower;

    /**
     * FIX:
     * Changed LAZY -> EAGER
     * Prevents serialization failure:
     *
     * BorrowTransaction -> BookCopy -> Book
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_copy_id", nullable = false)
    private BookCopy bookCopy;

    @Column(nullable = false)
    private LocalDate borrowDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    /**
     * null = not returned yet
     */
    private LocalDate returnDate;

    @Column(nullable = false)
    private boolean returned = false;

    /**
     * For in-library-only books.
     */
    private int inLibraryHours = 0;

    /**
     * One transaction can have one fine.
     */
    @OneToOne(mappedBy = "transaction", cascade = CascadeType.ALL)
    private Fine fine;

    // Convenience constructor
    public BorrowTransaction(
            User borrower,
            BookCopy bookCopy,
            LocalDate borrowDate,
            LocalDate dueDate
    ) {
        this.borrower = borrower;
        this.bookCopy = bookCopy;
        this.borrowDate = borrowDate;
        this.dueDate = dueDate;
        this.returned = false;
    }

    /**
     * Check overdue status.
     */
    public boolean isOverdue() {
        if (returned) return false;
        return LocalDate.now().isAfter(dueDate);
    }

    /**
     * Calculate overdue days.
     */
    public long getOverdueDays() {
        if (!isOverdue()) return 0;

        return java.time.temporal.ChronoUnit.DAYS
                .between(dueDate, LocalDate.now());
    }
}