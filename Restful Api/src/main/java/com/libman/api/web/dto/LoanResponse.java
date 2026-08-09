package com.libman.api.web.dto;

import com.libman.api.domain.Loan;
import com.libman.api.domain.enums.ReturnCondition;

import java.time.OffsetDateTime;

public record LoanResponse(
        Integer id,
        Integer borrowRequestId,
        Integer copyId,
        Integer userId,
        String userName,
        String bookTitle,
        String shelfLocation,
        OffsetDateTime holdStartedAt,
        OffsetDateTime holdExpiresAt,
        OffsetDateTime collectedAt,
        OffsetDateTime dueDate,
        OffsetDateTime returnedAt,
        ReturnCondition returnCondition,
        boolean extended,
        OffsetDateTime extendedDueDate,
        String loanState,
        Integer requestedDurationMinutes
) {
    public static LoanResponse from(Loan loan) {
        String state = loan.getReturnedAt() != null ? "returned" : loan.getCollectedAt() != null ? "on_loan" : "on_hold";
        return new LoanResponse(
                loan.getId(),
                loan.getBorrowRequest() != null ? loan.getBorrowRequest().getId() : null,
                loan.getCopy().getId(),
                loan.getUser().getId(),
                loan.getUser().getName(),
                loan.getCopy().getTitle().getName(),
                loan.getCopy().getShelfLocation(),
                loan.getHoldStartedAt(),
                loan.getHoldExpiresAt(),
                loan.getCollectedAt(),
                loan.getDueDate(),
                loan.getReturnedAt(),
                loan.getReturnCondition(),
                Boolean.TRUE.equals(loan.getExtended()),
                loan.getExtendedDueDate(),
                state,
                loan.getRequestedDurationMinutes()
        );
    }
}
