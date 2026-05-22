package com.library.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a unique book TITLE.
 * One title can have many BookCopy objects (one per physical copy).
 * OOP: COMPOSITION — Book has-many BookCopy.
 * FIX: @JsonIgnore on copies prevents infinite JSON serialization loop.
 */
@Entity
@Table(name = "books")
@Data @NoArgsConstructor
public class Book {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String title;
    @Column(nullable = false) private String author;
    private String isbn;
    private String genre;
    private String publisher;
    private int    publishedYear;
    private String description;

    /** If true: book stays inside library. Duration may be < 1 day. */
    @Column(nullable = false)
    private boolean restrictedFromRemoval = false;
    private int inLibraryHoursLimit = 0;

    /**
     * FIX: @JsonIgnore — prevents Jackson from serializing copies when
     * a Book is inside a BookCopy inside a BorrowTransaction → infinite loop.
     * Copies are still accessible via GET /api/books/{id}/copies.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookCopy> copies = new ArrayList<>();
}
