package com.library.service;

import com.library.model.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired private BookRepository              bookRepository;
    @Autowired private BookCopyRepository          bookCopyRepository;
    @Autowired private BorrowTransactionRepository transactionRepository;
    @Autowired private FineRepository              fineRepository;

    public List<Book>     getAllBooks()                { return bookRepository.findAll(); }
    public Optional<Book> getBookById(@NonNull Long id) { return bookRepository.findById(id); }

    // ── Add book + auto-create 1 AVAILABLE copy ──────────────────
    @Transactional
    public Book addBook(Book book) {
        Book saved = bookRepository.save(book);

        // Auto-create one copy so the book is immediately available
        BookCopy copy = new BookCopy();
        copy.setBook(saved);
        copy.setStatus(BookStatus.AVAILABLE);
        copy.setCopyCode("BOOK" + saved.getId() + "-COPY1");
        bookCopyRepository.save(copy);
        System.out.println("✅ Auto-created copy: " + copy.getCopyCode());

        return saved;
    }

    public Book updateBook(@NonNull Long id, Book u) {
        Book b = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found: " + id));
        b.setTitle(u.getTitle());           b.setAuthor(u.getAuthor());
        b.setIsbn(u.getIsbn());             b.setGenre(u.getGenre());
        b.setPublisher(u.getPublisher());   b.setPublishedYear(u.getPublishedYear());
        b.setDescription(u.getDescription());
        b.setRestrictedFromRemoval(u.isRestrictedFromRemoval());
        b.setInLibraryHoursLimit(u.getInLibraryHoursLimit());
        return bookRepository.save(b);
    }

    @Transactional
    public void deleteBook(@NonNull Long id) {
        if (!bookRepository.existsById(id))
            throw new RuntimeException("Book not found: " + id);

        fineRepository.deleteFinesByBookId(id);
        transactionRepository.deleteByBookId(id);
        bookCopyRepository.deleteByBookId(id);
        bookRepository.deleteById(id);
    }

    // ── Delete a single copy ─────────────────────────────────────
    @Transactional
    public void deleteBookCopy(@NonNull Long copyId) {
        BookCopy copy = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new RuntimeException("Copy not found: " + copyId));

        if (copy.getStatus() == BookStatus.BORROWED) {
            throw new RuntimeException("Cannot delete a copy that is currently BORROWED. Return it first.");
        }

        fineRepository.deleteFinesByCopyId(copyId);
        transactionRepository.deleteByCopyId(copyId);
        bookCopyRepository.deleteById(copyId);
        System.out.println("✅ Copy " + copyId + " deleted.");
    }

    // ── Copy stats for a book ────────────────────────────────────
    public java.util.Map<String, Long> getCopyStats(@NonNull Long bookId) {
        List<BookCopy> all = bookCopyRepository.findByBookId(bookId);
        long total     = all.size();
        long available = all.stream().filter(c -> c.getStatus() == BookStatus.AVAILABLE).count();
        long borrowed  = all.stream().filter(c -> c.getStatus() == BookStatus.BORROWED).count();
        long reserved  = all.stream().filter(c -> c.getStatus() == BookStatus.RESERVED).count();
        return java.util.Map.of(
            "total", total,
            "available", available,
            "borrowed", borrowed,
            "reserved", reserved
        );
    }

    // ── Search ───────────────────────────────────────────────────
    public List<Book> searchByTitle(String t)  { return bookRepository.findByTitleContainingIgnoreCase(t); }
    public List<Book> searchByAuthor(String a) { return bookRepository.findByAuthorContainingIgnoreCase(a); }
    public List<Book> searchByGenre(String g)  { return bookRepository.findByGenreIgnoreCase(g); }

    // ── Copies ───────────────────────────────────────────────────
    public BookCopy addBookCopy(@NonNull Long bookId, BookCopy copy) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));
        copy.setBook(book);
        copy.setStatus(BookStatus.AVAILABLE);
        if (copy.getCopyCode() == null || copy.getCopyCode().isBlank()) {
            long n = bookCopyRepository.findByBookId(bookId).size();
            copy.setCopyCode("BOOK" + bookId + "-COPY" + (n + 1));
        }
        BookCopy saved = bookCopyRepository.save(copy);
        System.out.println("✅ Copy added: " + saved.getCopyCode() + " status=" + saved.getStatus());
        return saved;
    }

    public List<BookCopy> getCopiesForBook(@NonNull Long bookId)   { return bookCopyRepository.findByBookId(bookId); }
    public List<BookCopy> getAvailableCopies(@NonNull Long bookId) { return bookCopyRepository.findByBookIdAndStatus(bookId, BookStatus.AVAILABLE); }

    public BookCopy updateCopyStatus(@NonNull Long copyId, BookStatus status) {
        BookCopy c = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new RuntimeException("Copy not found: " + copyId));
        c.setStatus(status);
        return bookCopyRepository.save(c);
    }
}
