package com.library.model;

/**
 * Status of a physical book copy.
 * OOP CONCEPT: ENUM — a special class with fixed constants.
 */
public enum BookStatus {
    AVAILABLE,    // Ready to be borrowed
    BORROWED,     // Currently with a user
    RESERVED,     // Reserved by someone (waiting)
    LOST,         // Reported lost
    DAMAGED       // Under repair / damaged
}
