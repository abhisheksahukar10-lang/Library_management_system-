package com.library.service;

import com.library.model.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Rule-based chatbot — keyword matching, NOT AI.
 * Simple and fully explainable: check keywords → return canned response.
 * NEW: Can look up book availability and basic info.
 */
@Service
public class ChatbotService {

    @Autowired private BookRepository     bookRepository;
    @Autowired private BookCopyRepository bookCopyRepository;
    @Autowired private FineRepository     fineRepository;
    @Autowired private BorrowTransactionRepository transactionRepository;

    public String respond(String message, Long userId) {
        String msg = message.toLowerCase().trim();

        // ── GREETINGS ────────────────────────────────────────────
        if (containsAny(msg, "hello", "hi", "hey", "good morning", "good evening")) {
            return "Hello! 👋 I'm the Library Assistant.\n\nI can help you with:\n"
                 + "• Book availability — try: 'is Java Programming available?'\n"
                 + "• Borrow limits — try: 'borrow limit'\n"
                 + "• Fine information — try: 'my fines'\n"
                 + "• Library hours — try: 'library hours'\n"
                 + "• Return instructions — try: 'how to return'";
        }

        // ── BOOK AVAILABILITY (NEW) ───────────────────────────────
        if (containsAny(msg, "available", "availability", "in stock", "can i get",
                         "do you have", "find book", "search book", "looking for")) {

            // Extract book keyword from the message
            String keyword = msg
                .replace("is", "").replace("available", "").replace("availability", "")
                .replace("in stock", "").replace("can i get", "").replace("do you have", "")
                .replace("find book", "").replace("search book", "").replace("looking for", "")
                .replace("book", "").trim();

            if (keyword.isEmpty()) {
                return "Please tell me the book name!\nExample: 'Is Clean Code available?' or 'Find book Java'";
            }

            // Search by title, then by author
            List<Book> results = bookRepository.findByTitleContainingIgnoreCase(keyword);
            if (results.isEmpty()) {
                results = bookRepository.findByAuthorContainingIgnoreCase(keyword);
            }
            if (results.isEmpty()) {
                results = bookRepository.findByGenreIgnoreCase(keyword);
            }

            if (results.isEmpty()) {
                return "😕 No books found matching '" + keyword + "'.\n"
                     + "Try a different keyword or check the Books section.";
            }

            StringBuilder reply = new StringBuilder("📚 Found " + results.size() + " result(s):\n\n");
            for (Book book : results.stream().limit(5).toList()) {
                long available = bookCopyRepository.findByBookIdAndStatus(book.getId(), BookStatus.AVAILABLE).size();
                long total     = bookCopyRepository.findByBookId(book.getId()).size();

                reply.append("📖 ").append(book.getTitle()).append("\n");
                reply.append("   Author: ").append(book.getAuthor()).append("\n");
                if (book.getGenre() != null && !book.getGenre().isBlank()) {
                    reply.append("   Genre: ").append(book.getGenre()).append("\n");
                }
                if (book.getPublishedYear() > 0) {
                    reply.append("   Year: ").append(book.getPublishedYear()).append("\n");
                }
                if (total == 0) {
                    reply.append("   📦 Status: No copies registered yet\n");
                } else if (available > 0) {
                    reply.append("   ✅ Status: AVAILABLE (").append(available).append("/").append(total).append(" copies free)\n");
                } else {
                    reply.append("   ❌ Status: ALL COPIES BORROWED (0/").append(total).append(" available)\n");
                }
                if (book.isRestrictedFromRemoval()) {
                    reply.append("   🔒 In-Library Use Only (max ").append(book.getInLibraryHoursLimit()).append(" hrs)\n");
                }
                reply.append("\n");
            }
            return reply.toString().trim();
        }

        // ── MY FINES ──────────────────────────────────────────────
        if (containsAny(msg, "my fine", "fine", "penalty", "late fee", "overdue", "owe")) {
            if (userId != null && userId > 0) {
                List<Fine> unpaid = fineRepository.findByUserIdAndPaid(userId, false);
                if (unpaid.isEmpty()) {
                    return "✅ Great news! You have no unpaid fines.";
                }
                double total = unpaid.stream().mapToDouble(Fine::getTotalAmount).sum();
                return "⚠️ You have " + unpaid.size() + " unpaid fine(s).\n"
                     + "Total due: €" + String.format("%.2f", total) + "\n\n"
                     + "Go to the Fines section to pay.";
            }
            return "💶 Fine Rates:\n"
                 + "• Students:  €1.00 per overdue day\n"
                 + "• Professors: €0.50 per overdue day\n\n"
                 + "Fines start from the day after the due date.";
        }

        // ── MY BORROWS ────────────────────────────────────────────
        if (containsAny(msg, "my borrow", "borrowed book", "active borrow", "currently borrowed")) {
            if (userId != null && userId > 0) {
                long active = transactionRepository.countByBorrowerIdAndReturned(userId, false);
                return "📤 You currently have " + active + " active borrow(s).\n"
                     + "Check your Dashboard for details and due dates.";
            }
            return "Please log in to see your borrows.";
        }

        // ── BORROW LIMIT ──────────────────────────────────────────
        if (containsAny(msg, "borrow limit", "how many", "max books", "how many books")) {
            return "📚 Borrow Limits:\n"
                 + "• 🎓 Students:   3 books for 14 days (€1.00/day overdue)\n"
                 + "• 👨‍🏫 Professors: 10 books for 30 days (€0.50/day overdue)\n\n"
                 + "⚠️ You cannot borrow if you have unpaid fines!";
        }

        // ── RETURN ────────────────────────────────────────────────
        if (containsAny(msg, "return", "how to return", "give back")) {
            return "↩️ To return a book:\n"
                 + "1. Ask the librarian (Admin)\n"
                 + "2. Admin goes to Borrow/Return page\n"
                 + "3. Selects your name → clicks ↩ Return\n\n"
                 + "If returned late, a fine is automatically calculated in euros.";
        }

        // ── LIBRARY HOURS ─────────────────────────────────────────
        if (containsAny(msg, "hours", "timing", "open", "close", "when")) {
            return "🕐 Library Hours:\n"
                 + "• Monday–Friday: 8:00 AM – 8:00 PM\n"
                 + "• Saturday:      9:00 AM – 5:00 PM\n"
                 + "• Sunday:        Closed\n\n"
                 + "Holiday schedule may vary.";
        }

        // ── RESTRICTED BOOKS ──────────────────────────────────────
        if (containsAny(msg, "restricted", "in-library", "library only", "reference")) {
            return "🔒 Reference / Restricted Books:\n"
                 + "Some books cannot leave the library.\n"
                 + "They are marked as 'In-Library Only'.\n"
                 + "Usage is limited to a few hours at a time inside the library.";
        }

        // ── DEFAULT ───────────────────────────────────────────────
        return "🤔 I didn't understand that. Try:\n\n"
             + "• 'Is Clean Code available?'    — check availability\n"
             + "• 'Find book Python'            — search books\n"
             + "• 'Borrow limit'                — policy info\n"
             + "• 'My fines'                    — your outstanding fines\n"
             + "• 'Library hours'               — opening times\n"
             + "• 'How to return'               — return instructions";
    }

    private boolean containsAny(String message, String... keywords) {
        for (String kw : keywords) {
            if (message.contains(kw)) return true;
        }
        return false;
    }
}
