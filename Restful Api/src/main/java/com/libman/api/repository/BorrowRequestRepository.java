package com.libman.api.repository;

import com.libman.api.domain.BorrowRequest;
import com.libman.api.domain.enums.BorrowRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Integer> {

    List<BorrowRequest> findByUserIdOrderByRequestedAtDesc(Integer userId);

    List<BorrowRequest> findByStatusOrderByRequestedAtAsc(BorrowRequestStatus status);

    List<BorrowRequest> findAllByOrderByRequestedAtDesc();

    long countByStatus(BorrowRequestStatus status);
}
