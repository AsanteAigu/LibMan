package com.libman.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HoldExpirationScheduler {

    private final LoanService loanService;

    /** Every 15 minutes -- fine-grained enough against a 6-hour hold window. */
    @Scheduled(fixedRate = 15 * 60 * 1000)
    public void releaseExpiredHolds() {
        loanService.expireUnclaimedHolds();
    }
}
