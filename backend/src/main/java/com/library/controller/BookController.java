package com.library.controller;

import com.library.model.Book;
import com.library.model.BookCopy;
import com.library.model.BookStatus;
import com.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Book addBook(@RequestBody Book book) {
        return bookService.addBook(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        try {
            return ResponseEntity.ok(bookService.updateBook(id, book));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public List<Book> search(@RequestParam(required = false) String title,
                             @RequestParam(required = false) String author,
                             @RequestParam(required = false) String genre) {
        if (title != null)  return bookService.searchByTitle(title);
        if (author != null) return bookService.searchByAuthor(author);
        if (genre != null)  return bookService.searchByGenre(genre);
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}/copies")
    public List<BookCopy> getCopies(@PathVariable Long id) {
        return bookService.getCopiesForBook(id);
    }

    @PostMapping("/{id}/copies")
    public BookCopy addCopy(@PathVariable Long id, @RequestBody BookCopy copy) {
        return bookService.addBookCopy(id, copy);
    }

    // ── NEW: Get copy stats (total / available / borrowed / reserved) ──
    @GetMapping("/{id}/copies/stats")
    public ResponseEntity<Map<String, Long>> getCopyStats(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookService.getCopyStats(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── NEW: Delete a single copy ──────────────────────────────────
    @DeleteMapping("/copies/{copyId}")
    public ResponseEntity<String> deleteCopy(@PathVariable Long copyId) {
        try {
            bookService.deleteBookCopy(copyId);
            return ResponseEntity.ok("Copy deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/copies/{copyId}/status")
    public ResponseEntity<BookCopy> updateCopyStatus(@PathVariable Long copyId,
                                                      @RequestBody Map<String, String> body) {
        try {
            BookStatus status = BookStatus.valueOf(body.get("status").toUpperCase());
            return ResponseEntity.ok(bookService.updateCopyStatus(copyId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
