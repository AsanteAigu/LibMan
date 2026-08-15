package com.libman.api.domain;

import com.libman.api.domain.enums.EbookLoanStatus;
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
@Table(name = "ebook_loans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EbookLoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ebook_edition_id", nullable = false)
    private EbookEdition ebookEdition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Generated(event = EventType.INSERT)
    @Column(name = "borrowed_at", insertable = false, updatable = false)
    private OffsetDateTime borrowedAt;

    @Column(name = "loan_expires_at", nullable = false)
    private OffsetDateTime loanExpiresAt;

    /** The duration originally chosen at borrow time; reapplied to loanExpiresAt if a
     * grace-period payment reactivates this loan (see EbookLoanService). */
    @Column(name = "requested_duration_minutes", nullable = false)
    private Integer requestedDurationMinutes;

    @Column(name = "grace_expires_at")
    private OffsetDateTime graceExpiresAt;

    @Column(name = "returned_at")
    private OffsetDateTime returnedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean extended = false;

    @Column(name = "extended_expires_at")
    private OffsetDateTime extendedExpiresAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    @Builder.Default
    private EbookLoanStatus status = EbookLoanStatus.active;
}
