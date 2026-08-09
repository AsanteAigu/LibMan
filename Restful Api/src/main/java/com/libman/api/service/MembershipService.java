package com.libman.api.service;

import com.libman.api.domain.Charge;
import com.libman.api.domain.User;
import com.libman.api.domain.enums.ChargeType;
import com.libman.api.domain.enums.UserRole;
import com.libman.api.repository.ChargeRepository;
import com.libman.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Every student owes a flat monthly membership fee; borrowing (physical or ebook) is
 * blocked while any charge is unpaid, via the existing unpaid-charges rule
 * (trg_check_unpaid_charges for physical loans, the equivalent check in
 * EbookLoanService for ebooks) -- this service's only job is making sure the current
 * month's charge actually exists so that rule has something to see.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipService {

    public static final BigDecimal MONTHLY_FEE = new BigDecimal("25.00");

    private final ChargeRepository chargeRepository;
    private final UserRepository userRepository;

    /** Librarians don't pay membership fees -- only students borrow. Safe to call on
     * every borrow attempt: a no-op once this month's charge already exists.
     * REQUIRES_NEW so the charge is committed on its own -- callers invoke this from
     * inside a borrow attempt that may go on to fail for unrelated reasons (no copy
     * available, etc.), and the fee must still be owed even if that attempt rolls back. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void ensureCurrentMonthCharge(User user) {
        if (user.getRole() != UserRole.user) {
            return;
        }
        OffsetDateTime periodStart = currentMonthStart();
        boolean exists = chargeRepository
                .findFirstByUserIdAndTypeAndCreatedAtGreaterThanEqual(user.getId(), ChargeType.membership_fee, periodStart)
                .isPresent();
        if (!exists) {
            chargeRepository.save(Charge.builder().user(user).type(ChargeType.membership_fee).amount(MONTHLY_FEE).build());
        }
    }

    /** Run monthly so every student's charge for the new month is visible up front,
     * rather than only appearing the moment they happen to try borrowing something. */
    @Transactional
    public void ensureCurrentMonthChargeForAllStudents() {
        for (User student : userRepository.findByRole(UserRole.user)) {
            ensureCurrentMonthCharge(student);
        }
        log.info("Ensured membership charges for the current month.");
    }

    private OffsetDateTime currentMonthStart() {
        return OffsetDateTime.now().withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
    }
}
