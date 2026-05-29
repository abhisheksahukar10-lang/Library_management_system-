package com.library.dto;

public record RegisterFacultyRequest(
    String name,
    String email,
    String phone,
    String password,
    String employeeId,
    String department,
    String designation
) {}
