package com.libman.api.web;

import com.libman.api.security.CurrentUser;
import com.libman.api.service.ReservationService;
import com.libman.api.web.dto.ReservationDtos.CreateReservationRequest;
import com.libman.api.web.dto.ReservationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public List<ReservationResponse> list(@RequestParam(required = false) Boolean mine, @AuthenticationPrincipal Jwt jwt) {
        if (Boolean.TRUE.equals(mine) || !CurrentUser.isLibrarian(jwt)) {
            return reservationService.listForUser(CurrentUser.id(jwt));
        }
        return reservationService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(@Valid @RequestBody CreateReservationRequest request, @AuthenticationPrincipal Jwt jwt) {
        return reservationService.create(CurrentUser.id(jwt), request.titleId());
    }

    @PatchMapping("/{id}/cancel")
    public ReservationResponse cancel(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        return reservationService.cancel(id, CurrentUser.id(jwt), CurrentUser.isLibrarian(jwt));
    }
}
