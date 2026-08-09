package com.libman.api.service;

import com.libman.api.domain.Copy;
import com.libman.api.domain.Loan;
import com.libman.api.domain.Title;
import com.libman.api.domain.User;
import com.libman.api.domain.enums.ChargeType;
import com.libman.api.domain.enums.ReturnCondition;
import com.libman.api.exception.AppException;
import com.libman.api.repository.ChargeRepository;
import com.libman.api.repository.LoanRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;
    @Mock
    private ChargeRepository chargeRepository;
    @Mock
    private SettingsService settingsService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private EntityManager entityManager;

    private LoanService loanService;
    private User borrower;
    private Loan loan;

    @BeforeEach
    void setUp() {
        loanService = new LoanService(loanRepository, chargeRepository, settingsService, notificationService, entityManager);

        borrower = User.builder().id(1).name("Ama Boateng").build();
        Title title = Title.builder().id(10).name("Clean Code").replacementCost(new BigDecimal("120.00")).build();
        Copy copy = Copy.builder().id(100).title(title).build();

        loan = Loan.builder()
                .id(1000)
                .user(borrower)
                .copy(copy)
                .collectedAt(OffsetDateTime.now().minusDays(20))
                .dueDate(OffsetDateTime.now().minusDays(6))
                .extended(false)
                .build();

        when(loanRepository.findById(1000)).thenReturn(Optional.of(loan));
    }

    @Test
    void returnLoan_appliesLateFee_whenReturnedAfterDueDate() {
        when(settingsService.getDecimal(eq("late_fee_per_day"), any())).thenReturn(new BigDecimal("2.00"));

        loanService.returnLoan(1000, ReturnCondition.ok);

        ArgumentCaptor<com.libman.api.domain.Charge> captor = ArgumentCaptor.forClass(com.libman.api.domain.Charge.class);
        verify(chargeRepository).save(captor.capture());

        com.libman.api.domain.Charge charge = captor.getValue();
        assertThat(charge.getType()).isEqualTo(ChargeType.late_fee);
        // ~6 days late * 2.00/day == 12.00
        assertThat(charge.getAmount()).isEqualByComparingTo("12.00");
    }

    @Test
    void returnLoan_appliesReplacementCostCharge_whenLost() {
        loan.setDueDate(OffsetDateTime.now().plusDays(1)); // not overdue -- isolates the lost-item charge alone

        loanService.returnLoan(1000, ReturnCondition.lost);

        ArgumentCaptor<com.libman.api.domain.Charge> captor = ArgumentCaptor.forClass(com.libman.api.domain.Charge.class);
        verify(chargeRepository).save(captor.capture());

        com.libman.api.domain.Charge charge = captor.getValue();
        assertThat(charge.getType()).isEqualTo(ChargeType.lost);
        assertThat(charge.getAmount()).isEqualByComparingTo("120.00");
    }

    @Test
    void returnLoan_appliesNoCharge_whenOnTimeAndOk() {
        loan.setDueDate(OffsetDateTime.now().plusDays(1));

        loanService.returnLoan(1000, ReturnCondition.ok);

        verify(chargeRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void extend_isRejected_forSomeoneWhoIsNotTheOwnerOrALibrarian() {
        assertThatThrownBy(() -> loanService.extend(1000, 999, false))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("your own loans");
    }

    @Test
    void extend_succeeds_forTheOwner() {
        when(loanRepository.save(any())).thenReturn(loan);

        var response = loanService.extend(1000, borrower.getId(), false);
        assertThat(response.extended()).isTrue();
    }
}
