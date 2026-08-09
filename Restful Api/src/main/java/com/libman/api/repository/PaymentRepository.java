package com.libman.api.repository;

import com.libman.api.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    List<Payment> findByUserIdOrderByPaidAtDesc(Integer userId);

    List<Payment> findAllByOrderByPaidAtDesc();

    boolean existsByPaystackReference(String paystackReference);
}
