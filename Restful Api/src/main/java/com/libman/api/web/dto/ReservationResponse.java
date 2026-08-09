package com.libman.api.web.dto;

import com.libman.api.domain.Reservation;
import com.libman.api.domain.enums.ReservationStatus;

import java.time.OffsetDateTime;

public record ReservationResponse(
        Integer id,
        Integer titleId,
        String bookTitle,
        Integer userId,
        String userName,
        Integer queuePosition,
        ReservationStatus status,
        OffsetDateTime notifiedAt,
        OffsetDateTime windowExpiresAt,
        OffsetDateTime createdAt
) {
    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getTitle().getId(),
                reservation.getTitle().getName(),
                reservation.getUser().getId(),
                reservation.getUser().getName(),
                reservation.getQueuePosition(),
                reservation.getStatus(),
                reservation.getNotifiedAt(),
                reservation.getWindowExpiresAt(),
                reservation.getCreatedAt()
        );
    }
}
