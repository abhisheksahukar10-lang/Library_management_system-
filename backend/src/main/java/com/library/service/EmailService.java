package com.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String name, String token) {
        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("📚 UniLibrary — Password Reset Request");
        message.setText(
            "Hello " + name + ",\n\n" +
            "We received a request to reset your UniLibrary password.\n\n" +
            "Click the link below to reset your password (valid for 30 minutes):\n\n" +
            resetLink + "\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Best regards,\nUniLibrary Team"
        );
        mailSender.send(message);
        System.out.println("✅ Password reset email sent to: " + toEmail);
    }

    public void sendWelcomeEmail(String toEmail, String name, String role) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("📚 Welcome to UniLibrary!");
        message.setText(
            "Hello " + name + ",\n\n" +
            "Your " + role + " account has been successfully created on UniLibrary.\n\n" +
            "You can now log in at: http://localhost:3000\n\n" +
            "Best regards,\nUniLibrary Team"
        );
        mailSender.send(message);
        System.out.println("✅ Welcome email sent to: " + toEmail);
    }

    public void sendFineEmail(String toEmail, String name, String bookTitle,
                              int overdueDays, double ratePerDay, double totalAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("📚 UniLibrary — Fine Issued for Overdue Book");
        message.setText(
            "Hello " + name + ",\n\n" +
            "A fine has been issued on your UniLibrary account for a late return.\n\n" +
            "Book       : " + bookTitle + "\n" +
            "Overdue    : " + overdueDays + " day(s)\n" +
            "Rate       : €" + ratePerDay + " / day\n" +
            "Total Fine : €" + totalAmount + "\n\n" +
            "Please pay your fine at the library to continue borrowing books.\n\n" +
            "Best regards,\nUniLibrary Team"
        );
        mailSender.send(message);
        System.out.println("✅ Fine email sent to: " + toEmail);
    }
}
