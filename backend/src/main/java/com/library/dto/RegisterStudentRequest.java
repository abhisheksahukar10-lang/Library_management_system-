package com.library.dto;

public record RegisterStudentRequest(
    String name,
    String email,
    String phone,
    String password,
    String studentId,
    String department,
    int    semester
) {}
