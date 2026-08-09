package com.libman.api.repository;

import com.libman.api.domain.Charge;
import com.libman.api.domain.enums.ChargeStatus;
import com.libman.api.domain.enums.ChargeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ChargeRepository extends JpaRepository<Charge, Integer> {

    List<Charge> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Charge> findAllByOrderByCreatedAtDesc();

    long countByUserIdAndStatus(Integer userId, ChargeStatus status);

    Optional<Charge> findFirstByUserIdAndTypeAndCreatedAtGreaterThanEqual(
            Integer userId, ChargeType type, OffsetDateTime createdAtFrom);
}
