package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

import java.time.LocalDate;

/**
 * Tracks how a book entered the library — purchased, donated, or on loan.
 *
 * Problem statement: "Books are acquired through either purchase,
 * donation or on loan (with a set time period)."
 *
 * OOP CONCEPT: ENCAPSULATION — private fields with getters/setters.
 */
@Entity
@Table(name = "book_acquisitions")
@Data
@NoArgsConstructor
public class BookAcquisition {

    @Nullable
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Type of acquisition: PURCHASE, DONATION, or LOAN
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AcquisitionType acquisitionType;

    @Column(nullable = false)
    private LocalDate acquisitionDate;

    /**
     * Which book was acquired.
     */
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // --- Fields used only for PURCHASE ---
    private Double purchasePrice;
    private String vendor;

    // --- Fields used only for DONATION ---
    private String donorName;
    private String donorContact;

    // --- Fields used only for LOAN ---
    private LocalDate loanReturnDate;   // Must return to lending library by this date
    private String lendingLibraryName;  // Which library lent us this book

    /**
     * Helper: Check if a loaned book is overdue to be returned to lending library.
     */
    public boolean isLoanOverdue() {
        if (acquisitionType != AcquisitionType.LOAN) return false;
        return loanReturnDate != null && LocalDate.now().isAfter(loanReturnDate);
    }

    /**
     * Helper: Get a human-readable description of this acquisition.
     */
    public String getAcquisitionSummary() {
        return switch (acquisitionType) {
            case PURCHASE -> "Purchased from " + vendor + " for €" + purchasePrice;
            case DONATION -> "Donated by " + donorName;
            case LOAN     -> "On loan from " + lendingLibraryName
                             + " (return by " + loanReturnDate + ")";
        };
    }
}
