package com.library.controller;

import com.library.model.BorrowTransaction;
import com.library.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    // POST /api/borrow  — { "userId": 1, "bookId": 5 }
    @PostMapping
    public ResponseEntity<?> borrowBook(@RequestBody Map<String, Long> body) {
        try {
            BorrowTransaction t = borrowService.borrowBook(
                    body.get("userId"), body.get("bookId"));
            return ResponseEntity.ok(t);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /api/borrow/{id}/return
    @PostMapping("/{transactionId}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long transactionId) {
        try {
            return ResponseEntity.ok(borrowService.returnBook(transactionId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<BorrowTransaction> getAll() { return borrowService.getAllTransactions(); }

    @GetMapping("/user/{userId}")
    public List<BorrowTransaction> getUserTransactions(@PathVariable Long userId) {
        return borrowService.getUserTransactions(userId);
    }

    @GetMapping("/user/{userId}/active")
    public List<BorrowTransaction> getActive(@PathVariable Long userId) {
        return borrowService.getActiveTransactions(userId);
    }

    @GetMapping("/overdue")
    public List<BorrowTransaction> getOverdue() { return borrowService.getOverdueTransactions(); }
}
