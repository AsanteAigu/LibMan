package com.libman.api.service;

import com.libman.api.domain.EbookEdition;
import com.libman.api.domain.EbookLoan;
import com.libman.api.domain.User;
import com.libman.api.domain.enums.ChargeStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;

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

    private static final String EBOOK_BUCKET = "ebooks";
    private static final int MIN_DURATION_MINUTES = 1;
    private static final int MAX_DURATION_MINUTES = 43_200; // 30 days

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
