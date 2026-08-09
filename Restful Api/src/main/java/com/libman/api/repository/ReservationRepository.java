package com.libman.api.repository;

import com.libman.api.domain.Reservation;
import com.libman.api.domain.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    List<Reservation> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Reservation> findAllByOrderByCreatedAtDesc();

    List<Reservation> findByTitleIdAndStatusOrderByQueuePositionAsc(Integer titleId, ReservationStatus status);

    long countByStatus(ReservationStatus status);

    long countByUserIdAndStatusIn(Integer userId, List<ReservationStatus> statuses);

    @Query("SELECT COALESCE(MAX(r.queuePosition), 0) FROM Reservation r WHERE r.title.id = :titleId")
    int findMaxQueuePosition(Integer titleId);
}
