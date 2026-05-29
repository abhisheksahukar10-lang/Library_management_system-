package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/** Admin user — full system access. */
@Entity
@Table(name = "admins")
@DiscriminatorValue("ADMIN")
@Data @EqualsAndHashCode(callSuper = true) @NoArgsConstructor
public class Admin extends User {

    @Override public int    getBorrowLimit()        { return 0; }
    @Override public int    getBorrowDurationDays() { return 0; }
    @Override public String getUserType()           { return "ADMIN"; }
}
