package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/** OOP: INHERITANCE. Faculty extends User. Borrow: 10 books / 30 days / €0.50/day */
@Entity
@Table(name = "faculty")
@jakarta.persistence.DiscriminatorValue("FACULTY")
@Data @EqualsAndHashCode(callSuper = true) @NoArgsConstructor
public class Faculty extends User {

    @Column(nullable = false, unique = true)
    private String employeeId;
    private String department;
    private String designation;

    @Override public int    getBorrowLimit()        { return 10; }
    @Override public int    getBorrowDurationDays() { return 30; }
    @Override public String getUserType()           { return "FACULTY"; }

    /** OOP: Overriding non-abstract method — Faculty has lower fine rate */
    @Override public double getFinePerDay() { return 0.50; } // €0.50/day
}
