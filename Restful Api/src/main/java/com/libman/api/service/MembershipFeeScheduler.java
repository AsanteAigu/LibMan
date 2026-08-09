package com.libman.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MembershipFeeScheduler {

    private final MembershipService membershipService;

    /** Midnight on the 1st of every month, server time. */
    @Scheduled(cron = "0 0 0 1 * *")
    public void createMonthlyCharges() {
        membershipService.ensureCurrentMonthChargeForAllStudents();
    }
}
