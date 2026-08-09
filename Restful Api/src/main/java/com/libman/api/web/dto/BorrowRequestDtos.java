package com.libman.api.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class BorrowRequestDtos {

    public record CreateBorrowRequestRequest(
            @NotNull(message = "Choose a title") Integer titleId,
            @NotNull(message = "Choose how long you'd like to borrow it for")
            @Min(value = 1, message = "Must be at least 1 minute")
            @Max(value = 43200, message = "Must be at most 30 days")
            Integer durationMinutes
    ) {
    }

    public record RejectRequest(String reason) {
    }
}
