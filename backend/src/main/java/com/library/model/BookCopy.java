package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents ONE physical copy of a book.
 *
 * Problem statement: "each book of the same name and same author
 * (but different number of copies) will have different ID."
 *
 * So if "Clean Code" has 3 copies:
 *   BookCopy 1: copyCode = "CC-001", Book(id=5)
 *   BookCopy 2: copyCode = "CC-002", Book(id=5)
 *   BookCopy 3: copyCode = "CC-003", Book(id=5)
 *
 * OOP CONCEPT: ASSOCIATION — BookCopy is associated with Book (many-to-one).
 */
@Entity
@Table(name = "book_copies")
@Data
@NoArgsConstructor
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique code for this physical copy. e.g., "BOOK5-COPY3"
     */
    @Column(nullable = false, unique = true)
    private String copyCode;

    /**
     * Current status of this copy.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookStatus status = BookStatus.AVAILABLE;

    /**
     * The book this copy belongs to.
     * OOP CONCEPT: ASSOCIATION (many copies belong to one book)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    /**
     * How this copy was acquired (purchased, donated, or on loan).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acquisition_id")
    private BookAcquisition acquisition;

    // Convenience constructor
    public BookCopy(String copyCode, Book book) {
        this.copyCode = copyCode;
        this.book = book;
        this.status = BookStatus.AVAILABLE;
    }

    /**
     * Helper: Check if this copy is available to be borrowed.
     */
    public boolean isAvailable() {
        return this.status == BookStatus.AVAILABLE;
    }
}
