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
 *  Uses @Modifying native SQL queries to delete in FK-safe order:
 *  1. Fines  →  2. Transactions  →  3. Copies  →  4. Book
 *  No JPA cascade problems. No entity-state issues. Guaranteed to work.
 */
@Service
public class BookService {

    @Autowired private BookRepository              bookRepository;
    @Autowired private BookCopyRepository          bookCopyRepository;
    @Autowired private BorrowTransactionRepository transactionRepository;
    @Autowired private FineRepository              fineRepository;

    public List<Book>    getAllBooks()          { return bookRepository.findAll(); }
    public Optional<Book> getBookById(Long id) { return bookRepository.findById(id); }
    public Book addBook(Book book)             { return bookRepository.save(book); }

    public Book updateBook(Long id, Book u) {
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

    /**
     * DELETE BOOK — FK-safe order:
     * fines → transactions → copies → book
     */
    @Transactional
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id))
            throw new RuntimeException("Book not found: " + id);

        System.out.println("🗑️ Deleting book " + id + " — step 1: fines");
        fineRepository.deleteFinesByBookId(id);

        System.out.println("🗑️ Deleting book " + id + " — step 2: transactions");
        transactionRepository.deleteByBookId(id);

        System.out.println("🗑️ Deleting book " + id + " — step 3: copies");
        bookCopyRepository.deleteByBookId(id);

        System.out.println("🗑️ Deleting book " + id + " — step 4: book");
        bookRepository.deleteById(id);

        System.out.println("✅ Book " + id + " deleted successfully.");
    }

    // ── Search ───────────────────────────────────────────────────
    public List<Book> searchByTitle(String t)  { return bookRepository.findByTitleContainingIgnoreCase(t); }
    public List<Book> searchByAuthor(String a) { return bookRepository.findByAuthorContainingIgnoreCase(a); }
    public List<Book> searchByGenre(String g)  { return bookRepository.findByGenreIgnoreCase(g); }

    // ── Copies ───────────────────────────────────────────────────
    /**
     * FIX: Explicitly sets status = AVAILABLE.
     * JSON deserialization does NOT preserve Java field defaults,
     * so without this line status would be null → borrow fails.
     */
    public BookCopy addBookCopy(Long bookId, BookCopy copy) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));
        copy.setBook(book);
        copy.setStatus(BookStatus.AVAILABLE); // ← CRITICAL FIX
        if (copy.getCopyCode() == null || copy.getCopyCode().isBlank()) {
            long n = bookCopyRepository.findByBookId(bookId).size();
            copy.setCopyCode("BOOK" + bookId + "-COPY" + (n + 1));
        }
        BookCopy saved = bookCopyRepository.save(copy);
        System.out.println("✅ Copy added: " + saved.getCopyCode() + " status=" + saved.getStatus());
        return saved;
    }

    public List<BookCopy> getCopiesForBook(Long bookId)    { return bookCopyRepository.findByBookId(bookId); }
    public List<BookCopy> getAvailableCopies(Long bookId)  { return bookCopyRepository.findByBookIdAndStatus(bookId, BookStatus.AVAILABLE); }

    public BookCopy updateCopyStatus(Long copyId, BookStatus status) {
        BookCopy c = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new RuntimeException("Copy not found: " + copyId));
        c.setStatus(status);
        return bookCopyRepository.save(c);
    }
}
