package com.libman.api.repository;

import com.libman.api.domain.UserBalanceView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserBalanceViewRepository extends JpaRepository<UserBalanceView, Integer> {

    Optional<UserBalanceView> findByUserId(Integer userId);
}
