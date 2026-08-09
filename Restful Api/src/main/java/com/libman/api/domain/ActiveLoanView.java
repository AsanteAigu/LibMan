package com.libman.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.time.OffsetDateTime;

/** Read-only mapping of the view_active_loans view (see Schema.sql). Never persisted. */
@Entity
@Immutable
@Table(name = "view_active_loans")
@Getter
@NoArgsConstructor
public class ActiveLoanView {

    @Id
    @Column(name = "loan_id")
    private Integer loanId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "book_title")
    private String bookTitle;

    @Column(name = "shelf_location")
    private String shelfLocation;

    @Column(name = "hold_expires_at")
    private OffsetDateTime holdExpiresAt;

    @Column(name = "collected_at")
    private OffsetDateTime collectedAt;

    @Column(name = "due_date")
    private OffsetDateTime dueDate;

    private Boolean extended;

    /** Computed by the view as plain text ('on_hold' | 'on_loan'), not a Postgres enum. */
    @Column(name = "loan_state")
    private String loanState;
}
