package com.library.controller;

import com.library.dto.*;
import com.library.model.*;
import com.library.repository.*;
import com.library.security.JwtUtil;
import com.library.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager       authenticationManager;
    @Autowired private JwtUtil                     jwtUtil;
    @Autowired private UserRepository              userRepository;
    @Autowired private StudentRepository           studentRepository;
    @Autowired private FacultyRepository           facultyRepository;
    @Autowired private AdminRepository             adminRepository;
    @Autowired private PasswordResetTokenRepository resetTokenRepository;
    @Autowired private PasswordEncoder             passwordEncoder;
    @Autowired private EmailService                emailService;

    // ── LOGIN ────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password.");
        }
        User user = userRepository.findByEmail(req.email()).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found.");
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole()));
    }

    // ── SELF-REGISTER STUDENT (public) ───────────────────────────
    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@RequestBody RegisterStudentRequest req) {
        if (userRepository.existsByEmail(req.email()))
            return ResponseEntity.badRequest().body("Email already registered.");

        Student s = new Student();
        s.setName(req.name());
        s.setEmail(req.email());
        s.setPhone(req.phone());
        s.setPassword(passwordEncoder.encode(req.password()));
        s.setRole("STUDENT");
        s.setStudentId(req.studentId());
        s.setDepartment(req.department());
        s.setSemester(req.semester());
        Student saved = studentRepository.save(s);

        try { emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), "Student"); }
        catch (Exception e) { System.err.println("⚠️ Welcome email failed: " + e.getMessage()); }

        return ResponseEntity.ok(saved);
    }

    // ── SELF-REGISTER FACULTY (public) ───────────────────────────
    @PostMapping("/register/faculty")
    public ResponseEntity<?> registerFaculty(@RequestBody RegisterFacultyRequest req) {
        if (userRepository.existsByEmail(req.email()))
            return ResponseEntity.badRequest().body("Email already registered.");

        Faculty f = new Faculty();
        f.setName(req.name());
        f.setEmail(req.email());
        f.setPhone(req.phone());
        f.setPassword(passwordEncoder.encode(req.password()));
        f.setRole("FACULTY");
        f.setEmployeeId(req.employeeId());
        f.setDepartment(req.department());
        f.setDesignation(req.designation());
        Faculty saved = facultyRepository.save(f);

        try { emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), "Faculty"); }
        catch (Exception e) { System.err.println("⚠️ Welcome email failed: " + e.getMessage()); }

        return ResponseEntity.ok(saved);
    }

    // ── FORGOT PASSWORD — send reset email ───────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.email()).orElse(null);
        // Always return OK to not reveal if email exists
        if (user == null)
            return ResponseEntity.ok("If that email is registered, a reset link has been sent.");

        // Delete any existing tokens for this user
        resetTokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        resetTokenRepository.save(resetToken);

        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        } catch (Exception e) {
            System.err.println("⚠️ Reset email failed: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to send email. Please try again.");
        }

        return ResponseEntity.ok("If that email is registered, a reset link has been sent.");
    }

    // ── RESET PASSWORD — use token from email ────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(req.token()).orElse(null);

        if (resetToken == null)
            return ResponseEntity.badRequest().body("Invalid or expired reset link.");
        if (resetToken.isUsed())
            return ResponseEntity.badRequest().body("This reset link has already been used.");
        if (resetToken.isExpired())
            return ResponseEntity.badRequest().body("Reset link has expired. Please request a new one.");

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        return ResponseEntity.ok("Password reset successfully. You can now log in.");
    }

    // ── CHANGE OWN PASSWORD (authenticated user) ─────────────────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestParam String email,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (!passwordEncoder.matches(oldPassword, user.getPassword()))
            return ResponseEntity.status(401).body("Old password incorrect.");

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully.");
    }

    // ── ADMIN: force-change any user's password ───────────────────
    @PostMapping("/admin/change-password")
    public ResponseEntity<?> adminChangePassword(@RequestBody AdminChangePasswordRequest req) {
        User user = userRepository.findByEmail(req.email()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("Password updated by admin.");
    }

    // ── ADMIN: create another admin ───────────────────────────────
    @PostMapping("/admin/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody CreateAdminRequest req) {
        if (userRepository.existsByEmail(req.email()))
            return ResponseEntity.badRequest().body("Email already registered.");

        Admin admin = new Admin();
        admin.setName(req.name());
        admin.setEmail(req.email());
        admin.setPhone(req.phone());
        admin.setPassword(passwordEncoder.encode(req.password()));
        admin.setRole("ADMIN");
        Admin saved = adminRepository.save(admin);

        try { emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), "Admin"); }
        catch (Exception e) { System.err.println("⚠️ Welcome email failed: " + e.getMessage()); }

        return ResponseEntity.ok(saved);
    }
}
