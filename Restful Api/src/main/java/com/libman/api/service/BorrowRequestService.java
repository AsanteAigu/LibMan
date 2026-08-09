package com.libman.api.service;

import com.libman.api.domain.BorrowRequest;
import com.libman.api.domain.Copy;
import com.libman.api.domain.User;
import com.libman.api.domain.enums.BorrowRequestStatus;
import com.libman.api.domain.enums.CopyStatus;
import com.libman.api.exception.AppException;
import com.libman.api.repository.BorrowRequestRepository;
import com.libman.api.repository.CopyRepository;
import com.libman.api.repository.UserRepository;
import com.libman.api.web.dto.BorrowRequestResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final CopyRepository copyRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final MembershipService membershipService;

    @Transactional(readOnly = true)
    public List<BorrowRequestResponse> listForUser(Integer userId) {
        return borrowRequestRepository.findByUserIdOrderByRequestedAtDesc(userId).stream()
                .map(BorrowRequestResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRequestResponse> list(BorrowRequestStatus status) {
        List<BorrowRequest> requests = status != null
                ? borrowRequestRepository.findByStatusOrderByRequestedAtAsc(status)
                : borrowRequestRepository.findAllByOrderByRequestedAtDesc();
        return requests.stream().map(BorrowRequestResponse::from).toList();
    }

    /**
     * Picks any available copy of the title. The approval trigger requires
     * copy_id to already be set on the row, so a title with no available copy
     * can't be requested this way -- the caller should reserve it instead.
     */
    @Transactional
    public BorrowRequestResponse create(Integer userId, Integer titleId, Integer durationMinutes) {
        User user = userRepository.findById(userId).orElseThrow(() -> AppException.notFound("User"));
        membershipService.ensureCurrentMonthCharge(user);
        Copy copy = copyRepository.findFirstByTitleIdAndStatus(titleId, CopyStatus.available)
                .orElseThrow(() -> AppException.conflict(
                        "NO_COPY_AVAILABLE", "No copies of this title are available right now. Try reserving it instead."));

        BorrowRequest request = BorrowRequest.builder()
                .user(user)
                .copy(copy)
                .requestedDurationMinutes(durationMinutes)
                .build();
        return BorrowRequestResponse.from(borrowRequestRepository.save(request));
    }

    @Transactional
    public BorrowRequestResponse approve(Integer requestId) {
        BorrowRequest request = requireRequest(requestId);
        if (request.getStatus() != BorrowRequestStatus.pending) {
            throw AppException.conflict("ALREADY_DECIDED", "This request has already been decided.");
        }

        request.setStatus(BorrowRequestStatus.approved);
        return saveAndRefresh(request);
    }

    @Transactional
    public BorrowRequestResponse reject(Integer requestId, String reason) {
        BorrowRequest request = requireRequest(requestId);
        if (request.getStatus() != BorrowRequestStatus.pending) {
            throw AppException.conflict("ALREADY_DECIDED", "This request has already been decided.");
        }

        request.setStatus(BorrowRequestStatus.rejected);
        request.setRejectionReason(reason == null || reason.isBlank() ? "No copies currently available" : reason);
        return saveAndRefresh(request);
    }

    private BorrowRequest requireRequest(Integer id) {
        return borrowRequestRepository.findById(id).orElseThrow(() -> AppException.notFound("Borrow request"));
    }

    /** decided_at is set by trg_handle_borrow_request_approval, not by this code --
     * flush the pending UPDATE, then refresh so the in-memory entity picks it up. */
    private BorrowRequestResponse saveAndRefresh(BorrowRequest request) {
        borrowRequestRepository.saveAndFlush(request);
        entityManager.refresh(request);
        return BorrowRequestResponse.from(request);
    }
}
