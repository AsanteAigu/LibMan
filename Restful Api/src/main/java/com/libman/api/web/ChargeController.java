package com.libman.api.web;

import com.libman.api.security.CurrentUser;
import com.libman.api.service.ChargeService;
import com.libman.api.web.dto.ChargeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/charges")
@RequiredArgsConstructor
public class ChargeController {

    private final ChargeService chargeService;

    @GetMapping
    public List<ChargeResponse> list(@RequestParam(required = false) Boolean mine, @AuthenticationPrincipal Jwt jwt) {
        if (Boolean.TRUE.equals(mine) || !CurrentUser.isLibrarian(jwt)) {
            return chargeService.listForUser(CurrentUser.id(jwt));
        }
        return chargeService.listAll();
    }
}
