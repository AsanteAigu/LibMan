package com.libman.api.service;

import com.libman.api.domain.Notification;
import com.libman.api.domain.User;
import com.libman.api.exception.AppException;
import com.libman.api.repository.NotificationRepository;
import com.libman.api.web.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> listForUser(Integer userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::from).toList();
    }

    @Transactional
    public NotificationResponse markRead(Integer id, Integer requesterId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Notification"));
        if (!notification.getUser().getId().equals(requesterId)) {
            throw AppException.forbidden("You can only read your own notifications.");
        }
        notification.setRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    /** Used internally (e.g. by LoanService when a charge is created) rather than exposed
     * as a public endpoint -- notifications are always a side effect of something else. */
    @Transactional
    public void notify(User user, String type, Integer referenceId, String message) {
        notificationRepository.save(Notification.builder()
                .user(user).type(type).referenceId(referenceId).message(message).build());
    }
}
