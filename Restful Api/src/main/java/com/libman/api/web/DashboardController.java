package com.libman.api.web;

import com.libman.api.security.CurrentUser;
import com.libman.api.service.DashboardService;
import com.libman.api.web.dto.DashboardDtos.LibrarianDashboardResponse;
import com.libman.api.web.dto.DashboardDtos.StudentDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/student")
    public StudentDashboardResponse student(@AuthenticationPrincipal Jwt jwt) {
        return dashboardService.studentStats(CurrentUser.id(jwt));
    }

    @GetMapping("/librarian")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public LibrarianDashboardResponse librarian() {
        return dashboardService.librarianStats();
    }
}
