package com.libman.api.web;

import com.libman.api.security.CurrentUser;
import com.libman.api.service.CatalogueService;
import com.libman.api.web.dto.CatalogueDtos.WithdrawCopyRequest;
import com.libman.api.web.dto.CopyResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/copies")
@RequiredArgsConstructor
public class CopyController {

    private final CatalogueService catalogueService;

    @PatchMapping("/{copyId}/withdraw")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public CopyResponse withdraw(
            @PathVariable Integer copyId,
            @Valid @RequestBody WithdrawCopyRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return catalogueService.withdrawCopy(copyId, request.reason(), CurrentUser.id(jwt));
    }
}
