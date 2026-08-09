package com.libman.api.service;

import com.libman.api.domain.Charge;
import com.libman.api.domain.Payment;
import com.libman.api.domain.User;
import com.libman.api.domain.enums.ChargeStatus;
import com.libman.api.domain.enums.PaymentMethod;
import com.libman.api.exception.AppException;
import com.libman.api.repository.ChargeRepository;
import com.libman.api.repository.PaymentRepository;
import com.libman.api.repository.UserRepository;
import com.libman.api.web.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ChargeRepository chargeRepository;
    private final UserRepository userRepository;
    private final PaystackService paystackService;

    @Transactional(readOnly = true)
    public List<PaymentResponse> listForUser(Integer userId) {
        return paymentRepository.findByUserIdOrderByPaidAtDesc(userId).stream().map(PaymentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listAll() {
        return paymentRepository.findAllByOrderByPaidAtDesc().stream().map(PaymentResponse::from).toList();
    }

    /** Inserting a payment fires trg_auto_clear_charge (AFTER INSERT), which flips the
     * charge to 'paid' -- that update lands on the charges table, not this row, so no refresh is needed. */
    @Transactional
    public PaymentResponse create(
            Integer chargeId, PaymentMethod method, String reference, Integer requesterId, boolean requesterIsLibrarian) {
        Charge charge = chargeRepository.findById(chargeId).orElseThrow(() -> AppException.notFound("Charge"));
        if (charge.getStatus() != ChargeStatus.unpaid) {
            throw AppException.conflict("ALREADY_PAID", "This charge has already been paid.");
        }
        if (method == PaymentMethod.cash && !requesterIsLibrarian) {
            throw AppException.forbidden("Only a librarian can record a cash payment.");
        }
        if (!requesterIsLibrarian && !charge.getUser().getId().equals(requesterId)) {
            throw AppException.forbidden("You can only pay your own charges.");
        }

        if (method == PaymentMethod.paystack) {
            verifyPaystackPayment(charge, reference);
        }

        User requester = userRepository.findById(requesterId).orElseThrow(() -> AppException.notFound("User"));

        Payment payment = Payment.builder()
                .charge(charge)
                .user(charge.getUser())
                .method(method)
                .amount(charge.getAmount())
                .paystackReference(method == PaymentMethod.paystack ? reference : null)
                .clearedByLibrarian(method == PaymentMethod.cash ? requester : null)
                .build();

        return PaymentResponse.from(paymentRepository.save(payment));
    }

    /** Never trust a client's "the payment went through" claim -- the reference from
     * Paystack's checkout popup is always re-checked against Paystack's own API, and the
     * amount actually paid must match this charge exactly (in pesewas, GHS's smallest unit). */
    private void verifyPaystackPayment(Charge charge, String reference) {
        if (reference == null || reference.isBlank()) {
            throw AppException.badRequest("MISSING_REFERENCE", "A Paystack transaction reference is required.");
        }
        if (paymentRepository.existsByPaystackReference(reference)) {
            throw AppException.conflict("REFERENCE_ALREADY_USED", "This payment has already been recorded.");
        }

        int expectedPesewas = charge.getAmount().multiply(BigDecimal.valueOf(100)).intValueExact();
        int paidPesewas = paystackService.verifySuccessfulAmount(reference)
                .orElseThrow(() -> AppException.unprocessable(
                        "PAYMENT_NOT_VERIFIED", "We couldn't verify this payment with Paystack."));
        if (paidPesewas != expectedPesewas) {
            throw AppException.unprocessable("AMOUNT_MISMATCH", "The amount paid doesn't match this charge.");
        }
    }
}
