package com.libman.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EbookLoanExpirationScheduler {

    private final EbookLoanService ebookLoanService;

    /** Every minute -- ebook loan durations can be as short as 1 minute, so this needs
     * to be far more frequent than HoldExpirationScheduler's 15-minute physical-hold check. */
    @Scheduled(fixedRate = 60 * 1000)
    public void expireOverdueLoans() {
        ebookLoanService.expireOverdueLoans();
        ebookLoanService.finalizeExpiredGraceLoans();
    }
}
