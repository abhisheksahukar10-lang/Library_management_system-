package com.library.service;

import com.library.model.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * FINAL DELETE FIX:
 *  Uses @Modifying native SQL to delete in FK-safe order:
 *  1. Fines  →  2. Transactions  →  3. User
 */
@Service
public class UserService {

    @Autowired private UserRepository              userRepository;
    @Autowired private StudentRepository           studentRepository;
    @Autowired private FacultyRepository           facultyRepository;
    @Autowired private BorrowTransactionRepository transactionRepository;
    @Autowired private FineRepository              fineRepository;

    public List<User>    getAllUsers()    { return userRepository.findAll();    }
    public List<Student> getAllStudents() { return studentRepository.findAll(); }
    public List<Faculty> getAllFaculty()  { return facultyRepository.findAll(); }

    public Optional<User> getUserById(Long id)        { return userRepository.findById(id); }
    public Optional<User> getUserByEmail(String email){ return userRepository.findByEmail(email); }

    // ── ADD ──────────────────────────────────────────────────────
    public Student addStudent(Student s) {
        if (userRepository.existsByEmail(s.getEmail()))
            throw new RuntimeException("Email already registered: " + s.getEmail());
        if (studentRepository.existsByStudentId(s.getStudentId()))
            throw new RuntimeException("Student ID already exists: " + s.getStudentId());
        Student saved = studentRepository.save(s);
        System.out.println("✅ Student added: " + saved.getName() + " (id=" + saved.getId() + ")");
        return saved;
    }

    public Faculty addFaculty(Faculty f) {
        if (userRepository.existsByEmail(f.getEmail()))
            throw new RuntimeException("Email already registered: " + f.getEmail());
        if (facultyRepository.existsByEmployeeId(f.getEmployeeId()))
            throw new RuntimeException("Employee ID already exists: " + f.getEmployeeId());
        Faculty saved = facultyRepository.save(f);
        System.out.println("✅ Faculty added: " + saved.getName() + " (id=" + saved.getId() + ")");
        return saved;
    }

    // ── UPDATE ────────────────────────────────────────────────────
    public Student updateStudent(Long id, Student u) {
        Student s = studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found: " + id));
        s.setName(u.getName()); s.setPhone(u.getPhone());
        s.setDepartment(u.getDepartment()); s.setSemester(u.getSemester());
        return studentRepository.save(s);
    }

    public Faculty updateFaculty(Long id, Faculty u) {
        Faculty f = facultyRepository.findById(id).orElseThrow(() -> new RuntimeException("Faculty not found: " + id));
        f.setName(u.getName()); f.setPhone(u.getPhone());
        f.setDepartment(u.getDepartment()); f.setDesignation(u.getDesignation());
        return facultyRepository.save(f);
    }

    // ── DELETE ────────────────────────────────────────────────────
    /**
     * DELETE USER — FK-safe order:
     * fines → transactions → user (JPA handles students/faculty subclass tables)
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id))
            throw new RuntimeException("User not found: " + id);

        System.out.println("🗑️ Deleting user " + id + " — step 1: fines");
        fineRepository.deleteAllByUserId(id);

        System.out.println("🗑️ Deleting user " + id + " — step 2: transactions");
        transactionRepository.deleteByUserId(id);

        System.out.println("🗑️ Deleting user " + id + " — step 3: user record");
        userRepository.deleteById(id);

        System.out.println("✅ User " + id + " deleted successfully.");
    }
}
