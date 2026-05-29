package com.library.controller;

import com.library.model.BorrowTransaction;
import com.library.model.PreBorrow;
import com.library.service.PreBorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/preborrow")
public class PreBorrowController {

    @Autowired private PreBorrowService preBorrowService;

    /** POST /api/preborrow — { userId, bookId } */
    @PostMapping
    public ResponseEntity<?> place(@RequestBody Map<String, Long> body) {
        try {
            PreBorrow pb = preBorrowService.placePreborrow(body.get("userId"), body.get("bookId"));
            return ResponseEntity.ok(pb);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** POST /api/preborrow/{id}/cancel — { userId } */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            return ResponseEntity.ok(preBorrowService.cancelPreborrow(id, body.get("userId")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST /api/preborrow/{id}/approve — Admin approves a reservation.
     * The chosen user immediately gets the book; other pending reservations
     * for the same book remain in the queue for the next available copy.
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> adminApprove(@PathVariable Long id) {
        try {
            BorrowTransaction tx = preBorrowService.adminApprove(id);
            return ResponseEntity.ok(tx);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** POST /api/preborrow/{id}/fulfil — { userId } — converts reservation → real borrow */
    @PostMapping("/{id}/fulfil")
    public ResponseEntity<?> fulfil(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            BorrowTransaction tx = preBorrowService.fulfil(id, body.get("userId"));
            return ResponseEntity.ok(tx);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** GET /api/preborrow/user/{userId} — all reservations */
    @GetMapping("/user/{userId}")
    public List<PreBorrow> getUserPreborrows(@PathVariable Long userId) {
        return preBorrowService.getUserPreborrows(userId);
    }

    /** GET /api/preborrow/user/{userId}/active */
    @GetMapping("/user/{userId}/active")
    public List<PreBorrow> getActive(@PathVariable Long userId) {
        return preBorrowService.getUserActivePreborrows(userId);
    }

    /** GET /api/preborrow — admin: all reservations */
    @GetMapping
    public List<PreBorrow> getAll() {
        return preBorrowService.getAll();
    }

    /** GET /api/preborrow/pending — admin: all PENDING reservations awaiting approval */
    @GetMapping("/pending")
    public List<PreBorrow> getPending() {
        return preBorrowService.getAllPending();
    }
}
