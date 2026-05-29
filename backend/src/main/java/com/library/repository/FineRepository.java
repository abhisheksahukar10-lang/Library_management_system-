package com.library.repository;

import com.library.model.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    List<Fine> findByUserId(Long userId);
    List<Fine> findByUserIdAndPaid(Long userId, boolean paid);

    @Modifying
    @jakarta.transaction.Transactional
    @Query(value = "DELETE FROM fines WHERE user_id = :userId", nativeQuery = true)
    void deleteAllByUserId(@Param("userId") Long userId);

    @Modifying
    @jakarta.transaction.Transactional
    @Query(value = """
        DELETE FROM fines
        WHERE transaction_id IN (
            SELECT bt.id FROM borrow_transactions bt
            INNER JOIN book_copies bc ON bt.book_copy_id = bc.id
            WHERE bc.book_id = :bookId
        )
        """, nativeQuery = true)
    void deleteFinesByBookId(@Param("bookId") Long bookId);

    // ── NEW: Delete fines for a single copy ───────────────────────
    @Modifying
    @jakarta.transaction.Transactional
    @Query(value = """
        DELETE FROM fines
        WHERE transaction_id IN (
            SELECT id FROM borrow_transactions WHERE book_copy_id = :copyId
        )
        """, nativeQuery = true)
    void deleteFinesByCopyId(@Param("copyId") Long copyId);
}
