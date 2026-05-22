package com.library.controller;

import com.library.model.Fine;
import com.library.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    @Autowired
    private FineService fineService;

    @GetMapping
    public List<Fine> getAll() { return fineService.getAllFines(); }

    @GetMapping("/user/{userId}")
    public List<Fine> getUserFines(@PathVariable Long userId) {
        return fineService.getFinesForUser(userId);
    }

    @GetMapping("/user/{userId}/unpaid")
    public List<Fine> getUnpaid(@PathVariable Long userId) {
        return fineService.getUnpaidFines(userId);
    }

    @PostMapping("/{fineId}/pay")
    public ResponseEntity<?> payFine(@PathVariable Long fineId) {
        try {
            return ResponseEntity.ok(fineService.payFine(fineId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
