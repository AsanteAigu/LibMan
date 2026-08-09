package com.libman.api.domain;

import com.libman.api.domain.enums.EbookFileFormat;
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
@Table(name = "ebook_editions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EbookEdition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "title_id", nullable = false, unique = true)
    private Title title;

    @Generated(event = EventType.INSERT)
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    /** Public Supabase Storage URL of the uploaded file, once a librarian has uploaded one. */
    @Column(name = "file_url")
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "file_format")
    private EbookFileFormat fileFormat;
}
