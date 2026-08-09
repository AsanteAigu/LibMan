package com.libman.api.web.dto;

import com.libman.api.domain.Copy;
import com.libman.api.domain.enums.CopyStatus;
import com.libman.api.domain.enums.WithdrawnReason;

import java.time.OffsetDateTime;

public record CopyResponse(
        Integer id,
        Integer titleId,
        String shelfLocation,
        String arrangementDetails,
        CopyStatus status,
        WithdrawnReason withdrawnReason,
        OffsetDateTime createdAt
) {
    public static CopyResponse from(Copy copy) {
        return new CopyResponse(
                copy.getId(),
                copy.getTitle().getId(),
                copy.getShelfLocation(),
                copy.getArrangementDetails(),
                copy.getStatus(),
                copy.getWithdrawnReason(),
                copy.getCreatedAt()
        );
    }
}
