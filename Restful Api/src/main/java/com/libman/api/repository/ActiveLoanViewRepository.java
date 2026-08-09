package com.libman.api.repository;

import com.libman.api.domain.ActiveLoanView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActiveLoanViewRepository extends JpaRepository<ActiveLoanView, Integer> {

    List<ActiveLoanView> findByUserIdOrderByDueDateAsc(Integer userId);

    List<ActiveLoanView> findAllByOrderByDueDateAsc();
}
