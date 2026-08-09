package com.libman.api.web;

import com.libman.api.security.CurrentUser;
import com.libman.api.service.PaymentService;
import com.libman.api.web.dto.PaymentDtos.CreatePaymentRequest;
import com.libman.api.web.dto.PaymentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public List<PaymentResponse> list(@RequestParam(required = false) Boolean mine, @AuthenticationPrincipal Jwt jwt) {
        if (Boolean.TRUE.equals(mine) || !CurrentUser.isLibrarian(jwt)) {
            return paymentService.listForUser(CurrentUser.id(jwt));
        }
        return paymentService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@Valid @RequestBody CreatePaymentRequest request, @AuthenticationPrincipal Jwt jwt) {
        return paymentService.create(
                request.chargeId(), request.method(), request.reference(), CurrentUser.id(jwt), CurrentUser.isLibrarian(jwt));
    }
}
