package com.libman.api.web;

import com.libman.api.security.CurrentUser;
import com.libman.api.service.EbookLoanService;
import com.libman.api.web.dto.EbookDtos.EbookEditionResponse;
import com.libman.api.web.dto.EbookDtos.EbookLoanResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EbookController {

    private final EbookLoanService ebookLoanService;

    @GetMapping("/api/ebook-editions")
    public List<EbookEditionResponse> listEditions() {
        return ebookLoanService.listEditions();
    }

    @GetMapping("/api/ebook-loans")
    public List<EbookLoanResponse> listLoans(@AuthenticationPrincipal Jwt jwt) {
        return ebookLoanService.listForUser(CurrentUser.id(jwt));
    }

    @PostMapping("/api/ebook-loans")
    @ResponseStatus(HttpStatus.CREATED)
    public EbookLoanResponse borrow(
            @RequestParam Integer ebookEditionId, @RequestParam Integer durationMinutes, @AuthenticationPrincipal Jwt jwt) {
        return ebookLoanService.borrow(CurrentUser.id(jwt), ebookEditionId, durationMinutes);
    }

    @PatchMapping("/api/ebook-loans/{id}/return")
    public EbookLoanResponse returnEbook(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        return ebookLoanService.returnEbook(id, CurrentUser.id(jwt));
    }

    @PostMapping("/api/ebook-editions/{id}/file")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public EbookEditionResponse uploadFile(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        return ebookLoanService.uploadFile(id, file);
    }
}
