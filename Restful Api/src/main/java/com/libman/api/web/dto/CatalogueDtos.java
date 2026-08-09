package com.libman.api.web.dto;

import com.libman.api.domain.enums.WithdrawnReason;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CatalogueDtos {

    public record CreateTitleRequest(
            @NotBlank(message = "Enter a title") String name,
            @NotBlank(message = "Enter an author") String author,
            @NotNull(message = "Enter a replacement cost")
            @DecimalMin(value = "0", message = "Replacement cost can't be negative") BigDecimal replacementCost,
            boolean hasEbook
    ) {
    }

    public record AddCopyRequest(String shelfLocation, String arrangementDetails) {
    }

    public record WithdrawCopyRequest(@NotNull(message = "Choose a reason") WithdrawnReason reason) {
    }
}
