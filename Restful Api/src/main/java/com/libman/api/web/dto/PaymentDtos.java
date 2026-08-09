package com.libman.api.web.dto;

import com.libman.api.domain.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public class PaymentDtos {

    public record CreatePaymentRequest(
            @NotNull(message = "Choose a charge") Integer chargeId,
            @NotNull(message = "Choose a payment method") PaymentMethod method,
            // Required when method is 'paystack': the transaction reference returned by
            // Paystack's checkout popup once the card payment actually completed. Verified
            // server-side against Paystack's API before the charge is ever marked paid.
            String reference
    ) {
    }
}
