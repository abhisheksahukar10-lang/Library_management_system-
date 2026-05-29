package com.library.repository;

import com.library.model.BookCopy;
import com.library.model.BookStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {

    List<BookCopy> findByBookId(Long bookId);
    List<BookCopy> findByBookIdAndStatus(Long bookId, BookStatus status);
    Optional<BookCopy> findFirstByBookIdAndStatus(Long bookId, BookStatus status);
    Optional<BookCopy> findByCopyCode(String copyCode);

    /** DELETE FIX: Remove all copies for a book. Called after transactions deleted. */
    @Modifying
    @jakarta.transaction.Transactional
    @Query(value = "DELETE FROM book_copies WHERE book_id = :bookId", nativeQuery = true)
    void deleteByBookId(@Param("bookId") Long bookId);
}
