package com.library.repository;

import com.library.model.BorrowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BorrowTransactionRepository extends JpaRepository<BorrowTransaction, Long> {

    List<BorrowTransaction> findByBorrowerId(Long userId);
    List<BorrowTransaction> findByBorrowerIdAndReturned(Long userId, boolean returned);
    long countByBorrowerIdAndReturned(Long userId, boolean returned);
    List<BorrowTransaction> findByBookCopyId(Long bookCopyId);

    @Query("SELECT t FROM BorrowTransaction t WHERE t.returned = false AND t.dueDate < CURRENT_DATE")
    List<BorrowTransaction> findAllOverdue();

    @Modifying
    @jakarta.transaction.Transactional
    @Query(value = "DELETE FROM borrow_transactions WHERE user_id = :userId", nativeQuery = true)
    void deleteByUserId(@Param("userId") Long userId);

    @Modifying
    @jakarta.transaction.Transactional
    @Query(value = """
        DELETE FROM borrow_transactions
        WHERE book_copy_id IN (
            SELECT id FROM book_copies WHERE book_id = :bookId
        )
        """, nativeQuery = true)
    void deleteByBookId(@Param("bookId") Long bookId);

    // ── NEW: Delete transactions for a single copy ─────────────────
    @Modifying
    @jakarta.transaction.Transactional
    @Query(value = "DELETE FROM borrow_transactions WHERE book_copy_id = :copyId", nativeQuery = true)
    void deleteByCopyId(@Param("copyId") Long copyId);
}
