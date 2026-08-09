package com.libman.api.web.dto;

import com.libman.api.domain.Payment;
import com.libman.api.domain.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResponse(
        Integer id,
        Integer chargeId,
        Integer userId,
        PaymentMethod method,
        BigDecimal amount,
        String paystackReference,
        Integer clearedByLibrarianId,
        OffsetDateTime paidAt
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getCharge().getId(),
                payment.getUser().getId(),
                payment.getMethod(),
                payment.getAmount(),
                payment.getPaystackReference(),
                payment.getClearedByLibrarian() != null ? payment.getClearedByLibrarian().getId() : null,
                payment.getPaidAt()
        );
    }
}
