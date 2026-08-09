package com.libman.api.service;

import com.libman.api.domain.Charge;
import com.libman.api.domain.Loan;
import com.libman.api.domain.enums.ChargeType;
import com.libman.api.domain.enums.ReturnCondition;
import com.libman.api.exception.AppException;
import com.libman.api.repository.ChargeRepository;
import com.libman.api.repository.LoanRepository;
import com.libman.api.web.dto.LoanResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoanService {

    private static final BigDecimal DEFAULT_LATE_FEE_PER_DAY = new BigDecimal("2.00");

    private final LoanRepository loanRepository;
    private final ChargeRepository chargeRepository;
    private final SettingsService settingsService;
    private final NotificationService notificationService;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<LoanResponse> listForUser(Integer userId) {
        return loanRepository.findByUserIdOrderByHoldStartedAtDesc(userId).stream().map(LoanResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> listActive() {
        return loanRepository.findByReturnedAtIsNullOrderByHoldStartedAtDesc().stream().map(LoanResponse::from).toList();
    }

    /** due_date is filled in by trg_handle_loan_collection when this newly sets collected_at. */
    @Transactional
    public LoanResponse collect(Integer loanId) {
        Loan loan = requireLoan(loanId);
        if (loan.getCollectedAt() != null) {
            throw AppException.conflict("ALREADY_COLLECTED", "This copy has already been collected.");
        }
        loan.setCollectedAt(OffsetDateTime.now());
        return LoanResponse.from(saveAndRefresh(loan));
    }

    /**
     * Marks the loan returned (trg_handle_loan_return then cascades the copy/reservation
     * state), then applies the two charge rules the schema provides the columns for but
     * has no trigger for: a late fee if it came back after due_date, and a
     * replacement-cost charge if it came back damaged or lost.
     */
    @Transactional
    public LoanResponse returnLoan(Integer loanId, ReturnCondition condition) {
        Loan loan = requireLoan(loanId);
        if (loan.getCollectedAt() == null) {
            throw AppException.conflict("NOT_COLLECTED", "This loan hasn't been collected yet.");
        }
        if (loan.getReturnedAt() != null) {
            throw AppException.conflict("ALREADY_RETURNED", "This loan has already been returned.");
        }

        OffsetDateTime returnedAt = OffsetDateTime.now();
        loan.setReturnedAt(returnedAt);
        loan.setReturnCondition(condition);
        loan = saveAndRefresh(loan);

        applyLateFeeIfOverdue(loan, returnedAt);
        applyDamageOrLossChargeIfNeeded(loan, condition);

        return LoanResponse.from(loan);
    }

    @Transactional
    public LoanResponse extend(Integer loanId, Integer requesterId, boolean requesterIsLibrarian) {
        Loan loan = requireLoan(loanId);
        if (!requesterIsLibrarian && !loan.getUser().getId().equals(requesterId)) {
            throw AppException.forbidden("You can only extend your own loans.");
        }
        if (loan.getCollectedAt() == null || loan.getReturnedAt() != null) {
            throw AppException.conflict("NOT_EXTENDABLE", "Only an active loan can be extended.");
        }
        if (Boolean.TRUE.equals(loan.getExtended())) {
            throw AppException.conflict("ALREADY_EXTENDED", "This loan has already been extended once.");
        }

        OffsetDateTime base = loan.getDueDate() != null ? loan.getDueDate() : OffsetDateTime.now();
        loan.setExtended(true);
        loan.setExtendedDueDate(base.plusDays(7));
        return LoanResponse.from(loanRepository.save(loan));
    }

    /**
     * A hold nobody collects within the window shouldn't sit stuck forever with no
     * due date and no consequence -- release it the same way a normal return would:
     * returned_at set (with collected_at/return_condition left null, which the relaxed
     * chk_collected_before_returned constraint now allows specifically for this case),
     * letting trg_handle_loan_return's existing cascade hand the copy to the next
     * reservation or release it back to available. No charge applies -- they never
     * actually took the book, so there's nothing to charge them for.
     */
    @Transactional
    public void expireUnclaimedHolds() {
        List<Loan> expired = loanRepository.findByHoldExpiresAtBeforeAndCollectedAtIsNullAndReturnedAtIsNull(OffsetDateTime.now());
        for (Loan loan : expired) {
            loan.setReturnedAt(OffsetDateTime.now());
            loanRepository.save(loan);
            notificationService.notify(loan.getUser(), "hold_expired", loan.getId(),
                    "Your hold on \"" + loan.getCopy().getTitle().getName() + "\" expired because it wasn't collected in time.");
        }
        if (!expired.isEmpty()) {
            log.info("Released {} unclaimed hold(s).", expired.size());
        }
    }

    private void applyLateFeeIfOverdue(Loan loan, OffsetDateTime returnedAt) {
        if (loan.getDueDate() == null || !returnedAt.isAfter(loan.getDueDate())) {
            return;
        }
        long daysLate = Math.max(1, Duration.between(loan.getDueDate(), returnedAt).toDays());
        BigDecimal perDay = settingsService.getDecimal("late_fee_per_day", DEFAULT_LATE_FEE_PER_DAY);
        BigDecimal amount = perDay.multiply(BigDecimal.valueOf(daysLate));

        chargeRepository.save(Charge.builder()
                .user(loan.getUser())
                .loan(loan)
                .type(ChargeType.late_fee)
                .amount(amount)
                .build());
        notificationService.notify(loan.getUser(), "charge_created", loan.getId(),
                "A late fee of GHS " + amount + " was added for \"" + loan.getCopy().getTitle().getName() + "\".");
    }

    private void applyDamageOrLossChargeIfNeeded(Loan loan, ReturnCondition condition) {
        if (condition != ReturnCondition.damaged && condition != ReturnCondition.lost) {
            return;
        }
        ChargeType type = condition == ReturnCondition.lost ? ChargeType.lost : ChargeType.damage;
        BigDecimal amount = loan.getCopy().getTitle().getReplacementCost();
        chargeRepository.save(Charge.builder()
                .user(loan.getUser())
                .loan(loan)
                .type(type)
                .amount(amount)
                .build());
        notificationService.notify(loan.getUser(), "charge_created", loan.getId(),
                "A GHS " + amount + " charge was added for a " + condition.name() + " return of \""
                        + loan.getCopy().getTitle().getName() + "\".");
    }

    private Loan requireLoan(Integer id) {
        return loanRepository.findById(id).orElseThrow(() -> AppException.notFound("Loan"));
    }

    private Loan saveAndRefresh(Loan loan) {
        loanRepository.saveAndFlush(loan);
        entityManager.refresh(loan);
        return loan;
    }
}
