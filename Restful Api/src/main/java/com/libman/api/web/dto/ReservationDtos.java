package com.libman.api.web.dto;

import jakarta.validation.constraints.NotNull;

public class ReservationDtos {

    public record CreateReservationRequest(@NotNull(message = "Choose a title") Integer titleId) {
    }
}
