package com.library.repository;

import com.library.model.PreBorrow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PreBorrowRepository extends JpaRepository<PreBorrow, Long> {

    List<PreBorrow> findByUserId(Long userId);

    List<PreBorrow> findByUserIdAndStatus(Long userId, PreBorrow.Status status);

    List<PreBorrow> findByStatus(PreBorrow.Status status);

    List<PreBorrow> findByBookIdAndStatusOrderByQueuePositionAsc(Long bookId, PreBorrow.Status status);

    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, PreBorrow.Status status);

    @Query("SELECT COUNT(p) FROM PreBorrow p WHERE p.book.id = :bookId AND p.status = 'PENDING'")
    int countPendingForBook(@Param("bookId") Long bookId);

    Optional<PreBorrow> findFirstByBookIdAndStatusOrderByQueuePositionAsc(Long bookId, PreBorrow.Status status);
}
