package com.libman.api.web.dto;

import com.libman.api.domain.Charge;
import com.libman.api.domain.enums.ChargeStatus;
import com.libman.api.domain.enums.ChargeType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ChargeResponse(
        Integer id,
        Integer userId,
        Integer loanId,
        Integer ebookLoanId,
        ChargeType type,
        BigDecimal amount,
        ChargeStatus status,
        String bookTitle,
        OffsetDateTime createdAt,
        OffsetDateTime clearedAt
) {
    public static ChargeResponse from(Charge charge) {
        String bookTitle = null;
        if (charge.getLoan() != null) {
            bookTitle = charge.getLoan().getCopy().getTitle().getName();
        } else if (charge.getEbookLoan() != null) {
            bookTitle = charge.getEbookLoan().getEbookEdition().getTitle().getName();
        }
        return new ChargeResponse(
                charge.getId(),
                charge.getUser().getId(),
                charge.getLoan() != null ? charge.getLoan().getId() : null,
                charge.getEbookLoan() != null ? charge.getEbookLoan().getId() : null,
                charge.getType(),
                charge.getAmount(),
                charge.getStatus(),
                bookTitle,
                charge.getCreatedAt(),
                charge.getClearedAt()
        );
    }
}
