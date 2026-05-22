package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/** OOP: INHERITANCE. Student extends User. Borrow: 3 books / 14 days / €1/day */
@Entity
@Table(name = "students")
@jakarta.persistence.DiscriminatorValue("STUDENT")
@Data @EqualsAndHashCode(callSuper = true) @NoArgsConstructor
public class Student extends User {

    @Column(nullable = false, unique = true)
    private String studentId;
    private String department;
    private int    semester;

    @Override public int    getBorrowLimit()        { return 3;  }
    @Override public int    getBorrowDurationDays() { return 14; }
    @Override public String getUserType()           { return "STUDENT"; }
    // Inherits getFinePerDay() = €1.00 from User
}
