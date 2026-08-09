package com.libman.api.web.dto;

import com.libman.api.domain.BorrowRequest;
import com.libman.api.domain.enums.BorrowRequestStatus;

import java.time.OffsetDateTime;

public record BorrowRequestResponse(
        Integer id,
        Integer userId,
        String userName,
        String bookTitle,
        Integer copyId,
        BorrowRequestStatus status,
        String rejectionReason,
        OffsetDateTime requestedAt,
        OffsetDateTime decidedAt,
        Integer requestedDurationMinutes
) {
    public static BorrowRequestResponse from(BorrowRequest request) {
        return new BorrowRequestResponse(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getName(),
                request.getCopy() != null ? request.getCopy().getTitle().getName() : null,
                request.getCopy() != null ? request.getCopy().getId() : null,
                request.getStatus(),
                request.getRejectionReason(),
                request.getRequestedAt(),
                request.getDecidedAt(),
                request.getRequestedDurationMinutes()
        );
    }
}
