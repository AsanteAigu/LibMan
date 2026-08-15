package com.libman.api.repository;

import com.libman.api.domain.EbookLoan;
import com.libman.api.domain.enums.EbookLoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface EbookLoanRepository extends JpaRepository<EbookLoan, Integer> {

    List<EbookLoan> findByUserIdOrderByBorrowedAtDesc(Integer userId);

    Optional<EbookLoan> findByEbookEditionIdAndUserIdAndStatusIn(
            Integer ebookEditionId, Integer userId, List<EbookLoanStatus> statuses);

    List<EbookLoan> findByStatusAndLoanExpiresAtBefore(EbookLoanStatus status, OffsetDateTime time);

    List<EbookLoan> findByStatusAndGraceExpiresAtBefore(EbookLoanStatus status, OffsetDateTime time);
}
