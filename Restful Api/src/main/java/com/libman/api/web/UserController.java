package com.libman.api.web;

import com.libman.api.domain.enums.UserRole;
import com.libman.api.service.UserService;
import com.libman.api.web.dto.UserHistoryResponse;
import com.libman.api.web.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LIBRARIAN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> search(
            @RequestParam(required = false) String q, @RequestParam(required = false) UserRole role) {
        return userService.search(q, role);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Integer id) {
        return userService.get(id);
    }

    @GetMapping("/{id}/history")
    public UserHistoryResponse history(@PathVariable Integer id) {
        return userService.getHistory(id);
    }
}
