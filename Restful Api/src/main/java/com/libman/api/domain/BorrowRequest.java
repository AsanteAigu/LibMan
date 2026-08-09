package com.libman.api.domain;

import com.libman.api.domain.enums.BorrowRequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.generator.EventType;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Entity
@Table(name = "borrow_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "copy_id")
    private Copy copy;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    @Builder.Default
    private BorrowRequestStatus status = BorrowRequestStatus.pending;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    /** How long the student wants the loan for, in minutes (1 minute to 30 days).
     * Carried onto the resulting loan by trg_handle_borrow_request_approval. */
    @Column(name = "requested_duration_minutes", nullable = false)
    private Integer requestedDurationMinutes;

    @Generated(event = EventType.INSERT)
    @Column(name = "requested_at", insertable = false, updatable = false)
    private OffsetDateTime requestedAt;

    /** Set by trg_handle_borrow_request_approval; never written from Java. */
    @Column(name = "decided_at", insertable = false, updatable = false)
    private OffsetDateTime decidedAt;
}
