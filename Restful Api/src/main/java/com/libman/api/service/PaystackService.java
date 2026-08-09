package com.libman.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;

/**
 * Verifies Paystack transactions server-side. A client-supplied "the payment succeeded"
 * claim is never trusted on its own -- the transaction reference is always checked
 * against Paystack's own API (using the secret key, backend-only) before a charge is
 * ever marked paid.
 */
@Slf4j
@Service
public class PaystackService {

    private final RestClient restClient;

    public PaystackService(@Value("${app.paystack.secret-key}") String secretKey) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.paystack.co")
                .defaultHeader("Authorization", "Bearer " + secretKey)
                .build();
    }

    /** Returns the amount actually paid, in pesewas (GHS's smallest unit), if and only
     * if Paystack confirms this reference's transaction genuinely succeeded. */
    @SuppressWarnings("unchecked")
    public Optional<Integer> verifySuccessfulAmount(String reference) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("/transaction/verify/{reference}", reference)
                    .retrieve()
                    .body(Map.class);
            if (response == null || !Boolean.TRUE.equals(response.get("status"))) {
                return Optional.empty();
            }
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            if (data == null || !"success".equals(data.get("status"))) {
                return Optional.empty();
            }
            return Optional.of((Integer) data.get("amount"));
        } catch (Exception e) {
            log.error("Paystack transaction verification failed for reference {}", reference, e);
            return Optional.empty();
        }
    }
}
