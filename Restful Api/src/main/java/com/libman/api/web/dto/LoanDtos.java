package com.libman.api.web.dto;

import com.libman.api.domain.enums.ReturnCondition;
import jakarta.validation.constraints.NotNull;

public class LoanDtos {

    public record ReturnLoanRequest(@NotNull(message = "Choose a condition") ReturnCondition condition) {
    }
}
