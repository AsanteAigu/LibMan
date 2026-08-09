package com.libman.api.service;

import com.libman.api.domain.enums.BorrowRequestStatus;
import com.libman.api.domain.enums.CopyStatus;
import com.libman.api.domain.enums.ReservationStatus;
import com.libman.api.repository.BorrowRequestRepository;
import com.libman.api.repository.CopyRepository;
import com.libman.api.repository.LoanRepository;
import com.libman.api.repository.ReservationRepository;
import com.libman.api.repository.UserBalanceViewRepository;
import com.libman.api.web.dto.DashboardDtos.LibrarianDashboardResponse;
import com.libman.api.web.dto.DashboardDtos.StudentDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LoanRepository loanRepository;
    private final ReservationRepository reservationRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final CopyRepository copyRepository;
    private final UserBalanceViewRepository userBalanceViewRepository;

    @Transactional(readOnly = true)
    public StudentDashboardResponse studentStats(Integer userId) {
        OffsetDateTime now = OffsetDateTime.now();
        return new StudentDashboardResponse(
                loanRepository.countByUserIdAndReturnedAtIsNullAndCollectedAtIsNotNull(userId),
                reservationRepository.countByUserIdAndStatusIn(userId, List.of(ReservationStatus.waiting, ReservationStatus.notified)),
                loanRepository.countByUserIdAndReturnedAtIsNullAndDueDateBefore(userId, now),
                userBalanceViewRepository.findByUserId(userId).map(v -> v.getTotalUnpaidAmount()).orElse(BigDecimal.ZERO)
        );
    }

    @Transactional(readOnly = true)
    public LibrarianDashboardResponse librarianStats() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startOfToday = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC);

        return new LibrarianDashboardResponse(
                borrowRequestRepository.countByStatus(BorrowRequestStatus.pending),
                loanRepository.countByReturnedAtIsNull(),
                loanRepository.countByReturnedAtBetween(startOfToday, now),
                reservationRepository.countByStatus(ReservationStatus.waiting),
                loanRepository.countByReturnedAtIsNullAndDueDateBefore(now),
                copyRepository.countByStatus(CopyStatus.available),
                copyRepository.count()
        );
    }
}
