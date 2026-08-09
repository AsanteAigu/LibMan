package com.libman.api.repository;

import com.libman.api.domain.WithdrawalLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WithdrawalLogRepository extends JpaRepository<WithdrawalLog, Integer> {
}
