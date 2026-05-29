package com.library.dto;
public record ResetPasswordRequest(String token, String newPassword) {}
