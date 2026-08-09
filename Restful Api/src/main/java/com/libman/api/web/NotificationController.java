package com.libman.api.web;

import com.libman.api.security.CurrentUser;
import com.libman.api.service.NotificationService;
import com.libman.api.web.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return notificationService.listForUser(CurrentUser.id(jwt));
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        return notificationService.markRead(id, CurrentUser.id(jwt));
    }
}
