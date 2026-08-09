package com.libman.api.web.dto;

import com.libman.api.domain.User;
import com.libman.api.domain.enums.UserRole;

import java.time.OffsetDateTime;

public record UserResponse(Integer id, String name, String email, UserRole role, OffsetDateTime createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }
}
