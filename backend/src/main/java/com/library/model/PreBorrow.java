package com.library.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

import java.time.LocalDate;

/**
 * A pre-borrow (reservation) placed when no copies are available.
 * When a copy becomes available the reservation is READY and the
 * user can pick it up and convert to a real BorrowTransaction.
 */
@Entity
@Table(name = "pre_borrows",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "book_id", "status"}))
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PreBorrow {

    public enum Status { PENDING, READY, FULFILLED, CANCELLED }

    @Nullable
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private LocalDate requestDate;

    /** Null until a copy becomes free and is assigned to this reservation. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_copy_id")
    private BookCopy assignedCopy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    /** Position in the queue for that book (1 = next). */
    @Column(nullable = false)
    private int queuePosition = 1;

    public PreBorrow(User user, Book book, LocalDate requestDate, int queuePosition) {
        this.user          = user;
        this.book          = book;
        this.requestDate   = requestDate;
        this.queuePosition = queuePosition;
        this.status        = Status.PENDING;
    }
}
