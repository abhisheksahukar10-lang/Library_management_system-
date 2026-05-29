package com.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Library Management System.
 * @SpringBootApplication enables auto-configuration, component scanning, etc.
 */
@SpringBootApplication
public class LibraryApplication {

    public static void main(String[] args) {
        SpringApplication.run(LibraryApplication.class, args);
        System.out.println("=== Library Management System Started ===");
        System.out.println("API running at: http://localhost:8080/api");
    }
}
