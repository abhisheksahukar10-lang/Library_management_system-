package com.library.model;

import jakarta.persistence.*;
import jakarta.persistence.DiscriminatorType;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * OOP: ABSTRACTION + ENCAPSULATION
 * Abstract parent — cannot be instantiated directly.
 * Student and Faculty override the abstract methods (POLYMORPHISM).
 * FIX: Removed password field (was causing NOT NULL constraint failure).
 * CHANGE: Fine rates now in EUROS.
 */
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
@Data
@NoArgsConstructor
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    // ── Abstract methods (Polymorphism) ──────────────────────────
    public abstract int    getBorrowLimit();
    public abstract int    getBorrowDurationDays();
    public abstract String getUserType();

    /** Fine rate in EUR per overdue day. Faculty overrides to give lower rate. */
    public double getFinePerDay() { return 1.00; } // €1.00 default (students)
}
