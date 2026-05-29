package com.library.config;

import com.library.model.Admin;
import com.library.repository.AdminRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default Admin account on first boot if none exists.
 * Credentials: admin@library.com / Admin@123
 * Change these in production!
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository  userRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@library.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            Admin admin = new Admin();
            admin.setName("Library Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole("ADMIN");
            admin.setPhone("000-000-0000");
            adminRepository.save(admin);
            System.out.println("✅ Default admin seeded: " + adminEmail + " / Admin@123");
        } else {
            System.out.println("ℹ️  Admin already exists — skipping seed.");
        }
    }
}
