package com.libman.api.service;

import com.libman.api.domain.User;
import com.libman.api.domain.enums.UserRole;
import com.libman.api.exception.AppException;
import com.libman.api.repository.UserRepository;
import com.libman.api.security.JwtService;
import com.libman.api.web.dto.AuthDtos.AuthResponse;
import com.libman.api.web.dto.AuthDtos.LoginRequest;
import com.libman.api.web.dto.AuthDtos.RegisterRequest;
import com.libman.api.web.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new AppException(HttpStatus.CONFLICT, "EMAIL_TAKEN", "An account with that email already exists.");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.user)
                .build();
        user = userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new AppException(
                        HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email or password is incorrect."));

        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    public UserResponse me(Integer userId) {
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(() -> AppException.notFound("User"));
    }
}
