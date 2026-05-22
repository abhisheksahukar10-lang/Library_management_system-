package com.library.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Fine levied for late return. Amount in EUROS.
 * FIX: @JsonIgnore on transaction prevents circular JSON loop
 *      (BorrowTransaction.fine → Fine.transaction → BorrowTransaction... ∞)
 */
@Entity
@Table(name = "fines")
@Data @NoArgsConstructor
public class Fine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * FIX: @JsonIgnore — we don't need the full transaction object inside Fine
     * (transaction already contains fine as a field — would be circular).
     */
    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "transaction_id", nullable = false)
    private BorrowTransaction transaction;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false) private int    overdueDays;
    @Column(nullable = false) private double fineAmountPerDay; // EUR
    @Column(nullable = false) private double totalAmount;      // EUR
    @Column(nullable = false) private LocalDate fineDate;
    private LocalDate paidDate;
    @Column(nullable = false) private boolean paid = false;

    /** Calculate fine in EUR. Rate depends on user type (polymorphism). */
    public void calculateFine(int days, double ratePerDay) {
        this.overdueDays      = days;
        this.fineAmountPerDay = ratePerDay;
        this.totalAmount      = Math.round(days * ratePerDay * 100.0) / 100.0;
        this.fineDate         = LocalDate.now();
        this.paid             = false;
    }

    public void markAsPaid() {
        this.paid     = true;
        this.paidDate = LocalDate.now();
    }

    public String getFineSummary() {
        return overdueDays + " days × €" + fineAmountPerDay + " = €" + totalAmount
                + (paid ? " (PAID)" : " (UNPAID)");
    }
}
