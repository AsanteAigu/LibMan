package com.libman.api.web.dto;

import com.libman.api.domain.Notification;

import java.time.OffsetDateTime;

public record NotificationResponse(
        Integer id, Integer userId, String type, Integer referenceId, String message, boolean read, OffsetDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUser().getId(),
                notification.getType(),
                notification.getReferenceId(),
                notification.getMessage(),
                Boolean.TRUE.equals(notification.getRead()),
                notification.getCreatedAt()
        );
    }
}
