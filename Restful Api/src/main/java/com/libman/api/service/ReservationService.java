package com.libman.api.service;

import com.libman.api.domain.Reservation;
import com.libman.api.domain.Title;
import com.libman.api.domain.User;
import com.libman.api.domain.enums.ReservationStatus;
import com.libman.api.exception.AppException;
import com.libman.api.repository.ReservationRepository;
import com.libman.api.repository.TitleRepository;
import com.libman.api.repository.UserRepository;
import com.libman.api.web.dto.ReservationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TitleRepository titleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReservationResponse> listForUser(Integer userId) {
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ReservationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> listAll() {
        return reservationRepository.findAllByOrderByCreatedAtDesc().stream().map(ReservationResponse::from).toList();
    }

    @Transactional
    public ReservationResponse create(Integer userId, Integer titleId) {
        Title title = titleRepository.findById(titleId).orElseThrow(() -> AppException.notFound("Title"));
        User user = userRepository.findById(userId).orElseThrow(() -> AppException.notFound("User"));

        int nextPosition = reservationRepository.findMaxQueuePosition(titleId) + 1;
        Reservation reservation = Reservation.builder()
                .title(title)
                .user(user)
                .queuePosition(nextPosition)
                .build();
        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse cancel(Integer reservationId, Integer requesterId, boolean requesterIsLibrarian) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> AppException.notFound("Reservation"));

        if (!requesterIsLibrarian && !reservation.getUser().getId().equals(requesterId)) {
            throw AppException.forbidden("You can only cancel your own reservations.");
        }
        if (reservation.getStatus() != ReservationStatus.waiting && reservation.getStatus() != ReservationStatus.notified) {
            throw AppException.conflict("NOT_CANCELLABLE", "This reservation can no longer be cancelled.");
        }

        reservation.setStatus(ReservationStatus.cancelled);
        return ReservationResponse.from(reservationRepository.save(reservation));
    }
}
