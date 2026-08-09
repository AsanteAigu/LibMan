package com.libman.api.domain;

import com.libman.api.domain.enums.ReturnCondition;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

/**
 * Loan rows are only ever INSERTed by the database triggers
 * (trg_handle_borrow_request_approval, trg_handle_loan_return) as a side
 * effect of other writes — the application never persists a new Loan here,
 * only reads existing rows and updates the collect/return/extend columns.
 * The identity/hold columns are mapped read-only accordingly.
 */
@Entity
@Table(name = "loans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_request_id", insertable = false, updatable = false)
    private BorrowRequest borrowRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "copy_id", insertable = false, updatable = false)
    private Copy copy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "hold_started_at", insertable = false, updatable = false)
    private OffsetDateTime holdStartedAt;

    @Column(name = "hold_expires_at", insertable = false, updatable = false)
    private OffsetDateTime holdExpiresAt;

    /** App-written: PATCH /loans/{id}/collect. Trigger fills due_date when this newly becomes non-null. */
    @Column(name = "collected_at")
    private OffsetDateTime collectedAt;

    @Column(name = "due_date")
    private OffsetDateTime dueDate;

    /** Copied from the borrow request by trg_handle_borrow_request_approval; read-only
     * here since only that trigger (and trg_handle_loan_return, for reservation
     * fulfillment loans, which leaves it null) ever sets it. */
    @Column(name = "requested_duration_minutes", insertable = false, updatable = false)
    private Integer requestedDurationMinutes;

    /** App-written: PATCH /loans/{id}/return. Trigger cascades reservation/copy state after. */
    @Column(name = "returned_at")
    private OffsetDateTime returnedAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "return_condition")
    private ReturnCondition returnCondition;

    @Column(nullable = false)
    @Builder.Default
    private Boolean extended = false;

    @Column(name = "extended_due_date")
    private OffsetDateTime extendedDueDate;
}
