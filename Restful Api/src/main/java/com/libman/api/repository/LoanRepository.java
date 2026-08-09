package com.libman.api.repository;

import com.libman.api.domain.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Integer> {

    List<Loan> findByUserIdOrderByHoldStartedAtDesc(Integer userId);

    List<Loan> findByReturnedAtIsNullOrderByHoldStartedAtDesc();

    Optional<Loan> findByBorrowRequestId(Integer borrowRequestId);

    Optional<Loan> findByCopyIdAndReturnedAtIsNull(Integer copyId);

    long countByReturnedAtIsNull();

    long countByReturnedAtIsNullAndDueDateBefore(OffsetDateTime now);

    long countByUserIdAndReturnedAtIsNullAndCollectedAtIsNotNull(Integer userId);

    long countByUserIdAndReturnedAtIsNullAndDueDateBefore(Integer userId, OffsetDateTime now);

    long countByReturnedAtBetween(OffsetDateTime start, OffsetDateTime end);

    List<Loan> findByHoldExpiresAtBeforeAndCollectedAtIsNullAndReturnedAtIsNull(OffsetDateTime cutoff);
}
