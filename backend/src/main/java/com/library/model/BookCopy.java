package com.library.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents ONE physical copy of a book.
 */
@Entity
@Table(name = "book_copies")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String copyCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookStatus status = BookStatus.AVAILABLE;

    /**
     * FIX:
     * Changed LAZY → EAGER
     * Prevents Hibernate proxy serialization issues.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    /**
     * Optional:
     * You can keep this LAZY for now.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acquisition_id")
    private BookAcquisition acquisition;

    public BookCopy(String copyCode, Book book) {
        this.copyCode = copyCode;
        this.book = book;
        this.status = BookStatus.AVAILABLE;
    }

    public boolean isAvailable() {
        return this.status == BookStatus.AVAILABLE;
    }
}