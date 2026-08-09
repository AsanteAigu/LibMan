package com.libman.api.web;

import com.libman.api.security.CurrentUser;
import com.libman.api.service.LoanService;
import com.libman.api.web.dto.LoanDtos.ReturnLoanRequest;
import com.libman.api.web.dto.LoanResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    public List<LoanResponse> list(@RequestParam(required = false) Boolean mine, @AuthenticationPrincipal Jwt jwt) {
        if (Boolean.TRUE.equals(mine) || !CurrentUser.isLibrarian(jwt)) {
            return loanService.listForUser(CurrentUser.id(jwt));
        }
        return loanService.listActive();
    }

    @PatchMapping("/{id}/collect")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public LoanResponse collect(@PathVariable Integer id) {
        return loanService.collect(id);
    }

    @PatchMapping("/{id}/return")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public LoanResponse returnLoan(@PathVariable Integer id, @Valid @RequestBody ReturnLoanRequest request) {
        return loanService.returnLoan(id, request.condition());
    }

    @PatchMapping("/{id}/extend")
    public LoanResponse extend(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        return loanService.extend(id, CurrentUser.id(jwt), CurrentUser.isLibrarian(jwt));
    }
}
