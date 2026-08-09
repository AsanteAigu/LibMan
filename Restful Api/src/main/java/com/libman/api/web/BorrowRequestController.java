package com.libman.api.web;

import com.libman.api.domain.enums.BorrowRequestStatus;
import com.libman.api.security.CurrentUser;
import com.libman.api.service.BorrowRequestService;
import com.libman.api.web.dto.BorrowRequestDtos.CreateBorrowRequestRequest;
import com.libman.api.web.dto.BorrowRequestDtos.RejectRequest;
import com.libman.api.web.dto.BorrowRequestResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow-requests")
@RequiredArgsConstructor
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    @GetMapping
    public List<BorrowRequestResponse> list(
            @RequestParam(required = false) BorrowRequestStatus status,
            @RequestParam(required = false) Boolean mine,
            @AuthenticationPrincipal Jwt jwt) {
        if (Boolean.TRUE.equals(mine) || !CurrentUser.isLibrarian(jwt)) {
            return borrowRequestService.listForUser(CurrentUser.id(jwt));
        }
        return borrowRequestService.list(status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BorrowRequestResponse create(
            @Valid @RequestBody CreateBorrowRequestRequest request, @AuthenticationPrincipal Jwt jwt) {
        return borrowRequestService.create(CurrentUser.id(jwt), request.titleId(), request.durationMinutes());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public BorrowRequestResponse approve(@PathVariable Integer id) {
        return borrowRequestService.approve(id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public BorrowRequestResponse reject(@PathVariable Integer id, @RequestBody(required = false) RejectRequest request) {
        return borrowRequestService.reject(id, request != null ? request.reason() : null);
    }
}
