package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

/**
 * Abstract User — ABSTRACTION + ENCAPSULATION.
 * Now includes hashed password and role for Spring Security.
 */
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
@Data
@NoArgsConstructor
public abstract class User {

    @Nullable
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    /** BCrypt-hashed password. */
    @Column(nullable = false)
    private String password;

    /** Role string: ADMIN | STUDENT | FACULTY */
    @Column(nullable = false)
    private String role;

    // ── Abstract methods (Polymorphism) ──────────────────────────
    public abstract int    getBorrowLimit();
    public abstract int    getBorrowDurationDays();
    public abstract String getUserType();

    /** Fine rate in EUR per overdue day. Faculty overrides to give lower rate. */
    public double getFinePerDay() { return 1.00; }
}
