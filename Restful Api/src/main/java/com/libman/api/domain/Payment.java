package com.libman.api.domain;

import com.libman.api.domain.enums.PaymentMethod;
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

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charge_id", nullable = false)
    private Charge charge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    private PaymentMethod method;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "paystack_reference", unique = true)
    private String paystackReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cleared_by_librarian_id")
    private User clearedByLibrarian;

    @Generated(event = EventType.INSERT)
    @Column(name = "paid_at", insertable = false, updatable = false)
    private OffsetDateTime paidAt;
}
