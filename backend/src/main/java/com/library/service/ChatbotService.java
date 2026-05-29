package com.library.service;

import com.library.model.Book;
import com.library.model.BookStatus;
import com.library.model.Fine;
import com.library.repository.BookCopyRepository;
import com.library.repository.BookRepository;
import com.library.repository.BorrowTransactionRepository;
import com.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ============================================================
 * LIBRARY CHATBOT SERVICE
 * ============================================================
 *
 * Type:
 * Rule-Based Intelligent Chatbot
 *
 * Features:
 * ✅ Greeting responses
 * ✅ Smart book search
 * ✅ Search by title
 * ✅ Search by author
 * ✅ Search by genre
 * ✅ Availability checking
 * ✅ Fine information
 * ✅ Borrow information
 * ✅ Borrow limits
 * ✅ Library timings
 * ✅ Return instructions
 * ✅ Restricted book information
 *
 * OOP Concepts:
 * ✅ Abstraction
 * ✅ Encapsulation
 * ✅ Association
 * ✅ Polymorphism
 *
 * ============================================================
 */
@Service
public class ChatbotService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCopyRepository bookCopyRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private BorrowTransactionRepository transactionRepository;

    /**
     * Main chatbot response method
     */
    public String respond(String message, Long userId) {

        // =====================================================
        // CLEAN USER MESSAGE
        // =====================================================

        String msg = message
                .toLowerCase()
                .trim();

        // =====================================================
        // GREETINGS
        // =====================================================

        if (containsAny(msg,
                "hello",
                "hi",
                "hey",
                "good morning",
                "good evening")) {

            return "👋 Hello! I'm the Library Assistant Bot.\n\n"

                    + "I can help you with:\n\n"

                    + "📚 Book availability\n"
                    + "💶 Fine information\n"
                    + "📤 Borrowed books\n"
                    + "📖 Borrow limits\n"
                    + "🕐 Library timings\n"
                    + "↩ Return process\n\n"

                    + "Try asking:\n"
                    + "• Is Clean Code available?\n"
                    + "• Find AI books\n"
                    + "• My fines\n"
                    + "• Borrow limit";
        }

        // =====================================================
        // SMART BOOK SEARCH
        // =====================================================

        if (containsAny(msg,
                "available",
                "availability",
                "book",
                "books",
                "find",
                "search",
                "looking for",
                "do you have",
                "can i get",
                "show",
                "novel")) {

            // =================================================
            // CLEAN SEARCH KEYWORD
            // =================================================

            String keyword = msg

                    // Remove punctuation
                    .replaceAll("[^a-zA-Z0-9 ]", " ")

                    // Remove common phrases
                    .replace("is", "")
                    .replace("available", "")
                    .replace("availability", "")
                    .replace("find", "")
                    .replace("search", "")
                    .replace("show", "")
                    .replace("looking for", "")
                    .replace("do you have", "")
                    .replace("can i get", "")
                    .replace("book", "")
                    .replace("books", "")
                    .replace("novel", "")

                    // Clean spaces
                    .trim()
                    .replaceAll("\\s+", " ");

            // =================================================
            // EMPTY KEYWORD
            // =================================================

            if (keyword.isBlank()) {

                return "📚 Please enter a book title, author, or genre.\n\n"

                        + "Examples:\n"
                        + "• Is Clean Code available?\n"
                        + "• Find AI books\n"
                        + "• Show books by Robert Martin\n"
                        + "• Search database books";
            }

            // =================================================
            // SEARCH BY TITLE
            // =================================================

            List<Book> results =
                    bookRepository.findByTitleContainingIgnoreCase(keyword);

            // =================================================
            // SEARCH BY AUTHOR
            // =================================================

            if (results.isEmpty()) {

                results =
                        bookRepository.findByAuthorContainingIgnoreCase(keyword);
            }

            // =================================================
            // SEARCH BY GENRE
            // =================================================

            if (results.isEmpty()) {

                results =
                        bookRepository.findByGenreIgnoreCase(keyword);
            }

            // =================================================
            // NO RESULTS FOUND
            // =================================================

            if (results.isEmpty()) {

                return "😕 No books found matching: '"
                        + keyword
                        + "'\n\n"

                        + "Try searching by:\n"
                        + "• Book title\n"
                        + "• Author name\n"
                        + "• Genre\n\n"

                        + "Examples:\n"
                        + "• Clean Code\n"
                        + "• Artificial Intelligence\n"
                        + "• Robert Martin";
            }

            // =================================================
            // BUILD RESPONSE
            // =================================================

            StringBuilder reply = new StringBuilder();

            reply.append("📚 Found ")
                    .append(results.size())
                    .append(" matching book(s):\n\n");

            for (Book book : results.stream().limit(5).toList()) {

                // Count available copies
                long availableCopies =
                        bookCopyRepository
                                .findByBookIdAndStatus(
                                        book.getId(),
                                        BookStatus.AVAILABLE
                                )
                                .size();

                // Count total copies
                long totalCopies =
                        bookCopyRepository
                                .findByBookId(book.getId())
                                .size();

                reply.append("━━━━━━━━━━━━━━━━━━━━━━\n");

                // Book Title
                reply.append("📖 ")
                        .append(book.getTitle())
                        .append("\n");

                // Author
                reply.append("✍ Author: ")
                        .append(book.getAuthor())
                        .append("\n");

                // Genre
                if (book.getGenre() != null &&
                        !book.getGenre().isBlank()) {

                    reply.append("🏷 Genre: ")
                            .append(book.getGenre())
                            .append("\n");
                }

                // Year
                if (book.getPublishedYear() > 0) {

                    reply.append("📅 Published: ")
                            .append(book.getPublishedYear())
                            .append("\n");
                }

                // Availability
                if (totalCopies == 0) {

                    reply.append("📦 No copies registered\n");
                }

                else if (availableCopies > 0) {

                    reply.append("✅ Available: ")
                            .append(availableCopies)
                            .append("/")
                            .append(totalCopies)
                            .append(" copies\n");
                }

                else {

                    reply.append("❌ Currently unavailable\n");
                }

                // Restricted Book
                if (book.isRestrictedFromRemoval()) {

                    reply.append("🔒 Library Use Only (")
                            .append(book.getInLibraryHoursLimit())
                            .append(" hrs max)\n");
                }

                reply.append("\n");
            }

            reply.append("💡 Tip: You can search by title, author, or genre.");

            return reply.toString().trim();
        }

        // =====================================================
        // MY FINES
        // =====================================================

        if (containsAny(msg,
                "fine",
                "fines",
                "penalty",
                "late fee",
                "overdue",
                "owe")) {

            // Logged-in user
            if (userId != null && userId > 0) {

                List<Fine> unpaid =
                        fineRepository.findByUserIdAndPaid(userId, false);

                // No fines
                if (unpaid.isEmpty()) {

                    return "✅ Great news! You have no unpaid fines.";
                }

                // Calculate total
                double total =
                        unpaid.stream()
                                .mapToDouble(Fine::getTotalAmount)
                                .sum();

                return "⚠️ You have "
                        + unpaid.size()
                        + " unpaid fine(s).\n\n"

                        + "💶 Total Due: €"
                        + String.format("%.2f", total)
                        + "\n\n"

                        + "Please visit the Fines section to pay.";
            }

            // General fine info
            return "💶 Fine Policy:\n\n"

                    + "🎓 Students:\n"
                    + "• €1.00/day overdue\n\n"

                    + "👨‍🏫 Professors:\n"
                    + "• €0.50/day overdue\n\n"

                    + "Fines begin after the due date.";
        }

        // =====================================================
        // BORROWED BOOKS
        // =====================================================

        if (containsAny(msg,
                "my borrow",
                "borrowed books",
                "active borrow",
                "currently borrowed")) {

            if (userId != null && userId > 0) {

                long active =
                        transactionRepository
                                .countByBorrowerIdAndReturned(
                                        userId,
                                        false
                                );

                return "📤 You currently have "
                        + active
                        + " active borrow(s).\n\n"

                        + "Check your dashboard for full details.";
            }

            return "Please login to view your borrowed books.";
        }

        // =====================================================
        // BORROW LIMIT
        // =====================================================

        if (containsAny(msg,
                "borrow limit",
                "max books",
                "how many books")) {

            return "📖 Borrow Policy:\n\n"

                    + "🎓 Students:\n"
                    + "• Maximum 3 books\n"
                    + "• 14 days duration\n"
                    + "• €1/day overdue fine\n\n"

                    + "👨‍🏫 Professors:\n"
                    + "• Maximum 10 books\n"
                    + "• 30 days duration\n"
                    + "• €0.50/day overdue fine\n\n"

                    + "⚠️ Borrowing is blocked if unpaid fines exist.";
        }

        // =====================================================
        // RETURN PROCESS
        // =====================================================

        if (containsAny(msg,
                "return",
                "how to return",
                "give back")) {

            return "↩ Book Return Process:\n\n"

                    + "1. Contact librarian/admin\n"
                    + "2. Open Borrow/Return page\n"
                    + "3. Select student\n"
                    + "4. Click Return\n\n"

                    + "Late returns automatically generate fines.";
        }

        // =====================================================
        // LIBRARY HOURS
        // =====================================================

        if (containsAny(msg,
                "hours",
                "timing",
                "open",
                "close")) {

            return "🕐 Library Working Hours:\n\n"

                    + "Monday–Friday: 8:00 AM – 8:00 PM\n"
                    + "Saturday: 9:00 AM – 5:00 PM\n"
                    + "Sunday: Closed";
        }

        // =====================================================
        // RESTRICTED BOOKS
        // =====================================================

        if (containsAny(msg,
                "restricted",
                "reference",
                "library only",
                "in-library")) {

            return "🔒 Restricted / Reference Books:\n\n"

                    + "These books cannot leave the library.\n"
                    + "They are available only for in-library reading.\n\n"

                    + "Usage time may be limited.";
        }

        // =====================================================
        // DEFAULT RESPONSE
        // =====================================================

        return "🤔 I didn't understand that.\n\n"

                + "Try asking:\n\n"

                + "📚 Is Clean Code available?\n"
                + "📖 Find AI books\n"
                + "💶 My fines\n"
                + "📤 My borrowed books\n"
                + "🕐 Library hours\n"
                + "↩ How to return books";
    }

    /**
     * Helper Method:
     * Checks whether message contains any keyword
     */
    private boolean containsAny(String message, String... keywords) {

        for (String keyword : keywords) {

            if (message.contains(keyword)) {

                return true;
            }
        }

        return false;
    }
}