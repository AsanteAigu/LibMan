package com.libman.api.domain;

import com.libman.api.domain.enums.WithdrawnReason;
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
@Table(name = "withdrawal_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "copy_id", nullable = false)
    private Copy copy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "librarian_id", nullable = false)
    private User librarian;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    private WithdrawnReason reason;

    @Generated(event = EventType.INSERT)
    @Column(name = "withdrawn_at", insertable = false, updatable = false)
    private OffsetDateTime withdrawnAt;
}
