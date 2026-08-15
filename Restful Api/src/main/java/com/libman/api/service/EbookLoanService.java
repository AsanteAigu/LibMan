package com.libman.api.service;

import com.libman.api.domain.Charge;
import com.libman.api.domain.EbookEdition;
import com.libman.api.domain.EbookLoan;
import com.libman.api.domain.User;
import com.libman.api.domain.enums.ChargeStatus;
import com.libman.api.domain.enums.ChargeType;
import com.libman.api.domain.enums.EbookFileFormat;
import com.libman.api.domain.enums.EbookLoanStatus;
import com.libman.api.exception.AppException;
import com.libman.api.repository.ChargeRepository;
import com.libman.api.repository.EbookEditionRepository;
import com.libman.api.repository.EbookLoanRepository;
import com.libman.api.repository.UserRepository;
import com.libman.api.web.dto.EbookDtos.EbookEditionResponse;
import com.libman.api.web.dto.EbookDtos.EbookLoanResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EbookLoanService {

    private static final List<EbookLoanStatus> ACTIVE_STATUSES = List.of(EbookLoanStatus.active, EbookLoanStatus.grace);

    private final EbookEditionRepository ebookEditionRepository;
    private final EbookLoanRepository ebookLoanRepository;
    private final ChargeRepository chargeRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService storageService;
    private final MembershipService membershipService;
    private final NotificationService notificationService;
    private final SettingsService settingsService;

    private static final String EBOOK_BUCKET = "ebooks";
    private static final int MIN_DURATION_MINUTES = 1;
    private static final int MAX_DURATION_MINUTES = 43_200; // 30 days
    private static final BigDecimal DEFAULT_GRACE_FEE = new BigDecimal("5.00");
    private static final int GRACE_WINDOW_HOURS = 24;

    @Transactional(readOnly = true)
    public List<EbookEditionResponse> listEditions() {
        return ebookEditionRepository.findAll().stream().map(EbookEditionResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<EbookLoanResponse> listForUser(Integer userId) {
        return ebookLoanRepository.findByUserIdOrderByBorrowedAtDesc(userId).stream().map(EbookLoanResponse::from).toList();
    }

    /** Physical borrowing blocks on unpaid charges via a DB trigger (trg_check_unpaid_charges);
     * ebook_loans has no such trigger, so the same rule is applied here for consistency. */
    @Transactional
    public EbookLoanResponse borrow(Integer userId, Integer ebookEditionId, Integer durationMinutes) {
        if (durationMinutes == null || durationMinutes < MIN_DURATION_MINUTES || durationMinutes > MAX_DURATION_MINUTES) {
            throw AppException.badRequest("INVALID_DURATION", "Choose a duration between 1 minute and 30 days.");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> AppException.notFound("User"));
        membershipService.ensureCurrentMonthCharge(user);

        if (chargeRepository.countByUserIdAndStatus(userId, ChargeStatus.unpaid) > 0) {
            throw AppException.unprocessable("UNPAID_CHARGES", "You have unpaid charges and can't borrow new items.");
        }
        if (ebookLoanRepository.findByEbookEditionIdAndUserIdAndStatusIn(ebookEditionId, userId, ACTIVE_STATUSES).isPresent()) {
            throw AppException.conflict("ALREADY_BORROWED", "You already have this ebook borrowed.");
        }

        EbookEdition edition = ebookEditionRepository.findById(ebookEditionId)
                .orElseThrow(() -> AppException.notFound("Ebook edition"));

        EbookLoan loan = EbookLoan.builder()
                .ebookEdition(edition)
                .user(user)
                .loanExpiresAt(OffsetDateTime.now().plusMinutes(durationMinutes))
                .requestedDurationMinutes(durationMinutes)
                .build();
        return EbookLoanResponse.from(ebookLoanRepository.save(loan));
    }

    @Transactional
    public EbookLoanResponse returnEbook(Integer loanId, Integer requesterId) {
        EbookLoan loan = ebookLoanRepository.findById(loanId).orElseThrow(() -> AppException.notFound("Ebook loan"));
        if (!loan.getUser().getId().equals(requesterId)) {
            throw AppException.forbidden("You can only return your own ebook loans.");
        }
        loan.setReturnedAt(OffsetDateTime.now());
        loan.setStatus(EbookLoanStatus.returned);
        return EbookLoanResponse.from(ebookLoanRepository.save(loan));
    }

    /**
     * Runs every minute (durations can be as short as 1 minute) via
     * EbookLoanExpirationScheduler. An active loan whose loan_expires_at has passed
     * loses read access immediately: it moves to 'grace' and a payable charge is
     * created, mirroring the physical-loan late-fee pattern in LoanService but gating
     * access instead of just billing for it.
     */
    @Transactional
    public void expireOverdueLoans() {
        List<EbookLoan> overdue = ebookLoanRepository.findByStatusAndLoanExpiresAtBefore(
                EbookLoanStatus.active, OffsetDateTime.now());
        for (EbookLoan loan : overdue) {
            loan.setStatus(EbookLoanStatus.grace);
            loan.setGraceExpiresAt(OffsetDateTime.now().plusHours(GRACE_WINDOW_HOURS));
            ebookLoanRepository.save(loan);

            BigDecimal fee = settingsService.getDecimal("ebook_grace_fee", DEFAULT_GRACE_FEE);
            chargeRepository.save(Charge.builder()
                    .user(loan.getUser())
                    .ebookLoan(loan)
                    .type(ChargeType.ebook_grace_expiry)
                    .amount(fee)
                    .build());
            notificationService.notify(loan.getUser(), "ebook_loan_expired", loan.getId(),
                    "Your reading time for \"" + loan.getEbookEdition().getTitle().getName()
                            + "\" ended. Pay GHS " + fee + " within 24 hours to keep reading, or it will be removed.");
        }
        if (!overdue.isEmpty()) {
            log.info("Moved {} overdue ebook loan(s) into grace.", overdue.size());
        }
    }

    /** A grace loan nobody paid for in time is removed outright -- the unpaid charge
     * stays on their account (still blocking new borrows), but reading access is gone
     * and the edition frees up for them to borrow again from scratch if they choose. */
    @Transactional
    public void finalizeExpiredGraceLoans() {
        List<EbookLoan> lapsed = ebookLoanRepository.findByStatusAndGraceExpiresAtBefore(
                EbookLoanStatus.grace, OffsetDateTime.now());
        for (EbookLoan loan : lapsed) {
            loan.setStatus(EbookLoanStatus.removed);
            ebookLoanRepository.save(loan);
            notificationService.notify(loan.getUser(), "ebook_loan_removed", loan.getId(),
                    "\"" + loan.getEbookEdition().getTitle().getName() + "\" was removed from your ebooks after the grace period lapsed.");
        }
        if (!lapsed.isEmpty()) {
            log.info("Removed {} unpaid grace ebook loan(s).", lapsed.size());
        }
    }

    /** Called by PaymentService once an ebook_grace_expiry charge is paid -- restores
     * full reading access for the same duration the borrower originally chose. */
    @Transactional
    public void reactivateAfterGracePayment(EbookLoan loan) {
        loan.setStatus(EbookLoanStatus.active);
        loan.setLoanExpiresAt(OffsetDateTime.now().plusMinutes(loan.getRequestedDurationMinutes()));
        loan.setGraceExpiresAt(null);
        ebookLoanRepository.save(loan);
        notificationService.notify(loan.getUser(), "ebook_loan_reactivated", loan.getId(),
                "Payment received -- \"" + loan.getEbookEdition().getTitle().getName() + "\" is readable again.");
    }

    @Transactional
    public EbookEditionResponse uploadFile(Integer ebookEditionId, MultipartFile file) {
        EbookEdition edition = ebookEditionRepository.findById(ebookEditionId)
                .orElseThrow(() -> AppException.notFound("Ebook edition"));

        String extension = extensionOf(file.getOriginalFilename());
        EbookFileFormat format = switch (extension) {
            case "pdf" -> EbookFileFormat.pdf;
            case "epub" -> EbookFileFormat.epub;
            default -> throw AppException.badRequest("UNSUPPORTED_FORMAT", "Only PDF and EPUB files are supported.");
        };

        String url = storageService.upload(file, EBOOK_BUCKET, extension);
        edition.setFileUrl(url);
        edition.setFileFormat(format);
        return EbookEditionResponse.from(ebookEditionRepository.save(edition));
    }

    private String extensionOf(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
