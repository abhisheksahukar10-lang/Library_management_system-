package com.library.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a unique book TITLE.
 * One title can have many physical copies.
 *
 * OOP CONCEPT:
 * COMPOSITION → Book has-many BookCopy.
 *
 * FIXES:
 * - Prevent infinite JSON recursion
 * - Prevent Hibernate lazy proxy serialization issues
 */
@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Book {

    @Nullable
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String isbn;

    private String genre;

    private String publisher;

    private int publishedYear;

    private String description;

    /**
     * If true:
     * Book cannot leave library premises.
     */
    @Column(nullable = false)
    private boolean restrictedFromRemoval = false;

    /**
     * Allowed in-library usage duration.
     */
    private int inLibraryHoursLimit = 0;

    /**
     * FIX:
     * Prevents infinite recursion:
     *
     * Book -> copies -> BookCopy -> book -> copies...
     */
    @JsonIgnore
    @OneToMany(
            mappedBy = "book",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    private List<BookCopy> copies = new ArrayList<>();
}