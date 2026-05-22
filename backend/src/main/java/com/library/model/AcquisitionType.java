package com.library.model;

/**
 * How the library acquired a book.
 * Problem statement: Purchase, Donation, or Loan (with return date).
 */
public enum AcquisitionType {
    PURCHASE,    // Library bought it
    DONATION,    // Donated by someone
    LOAN         // Borrowed from another library (must return by loanReturnDate)
}
