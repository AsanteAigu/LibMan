package com.libman.api.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank(message = "Enter your full name") String name,
            @NotBlank(message = "Enter your email") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Enter a password") @Size(min = 8, message = "Password must be at least 8 characters") String password
    ) {
    }

    public record LoginRequest(
            @NotBlank(message = "Enter your email") String email,
            @NotBlank(message = "Enter your password") String password
    ) {
    }

    public record AuthResponse(String token, UserResponse user) {
    }
}
