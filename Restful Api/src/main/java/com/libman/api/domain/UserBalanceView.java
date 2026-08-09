package com.libman.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/** Read-only mapping of the view_user_balances view (see Schema.sql). Never persisted. */
@Entity
@Immutable
@Table(name = "view_user_balances")
@Getter
@NoArgsConstructor
public class UserBalanceView {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "total_unpaid_amount")
    private BigDecimal totalUnpaidAmount;
}
