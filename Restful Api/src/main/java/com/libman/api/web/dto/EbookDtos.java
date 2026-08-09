package com.libman.api.web.dto;

import com.libman.api.domain.EbookEdition;
import com.libman.api.domain.EbookLoan;
import com.libman.api.domain.enums.EbookFileFormat;
import com.libman.api.domain.enums.EbookLoanStatus;

import java.time.OffsetDateTime;

public class EbookDtos {

    public record EbookEditionResponse(
            Integer id, Integer titleId, String bookTitle, String author, String fileUrl, EbookFileFormat fileFormat,
            String coverImageUrl
    ) {
        public static EbookEditionResponse from(EbookEdition edition) {
            return new EbookEditionResponse(
                    edition.getId(),
                    edition.getTitle().getId(),
                    edition.getTitle().getName(),
                    edition.getTitle().getAuthor(),
                    edition.getFileUrl(),
                    edition.getFileFormat(),
                    edition.getTitle().getCoverImageUrl()
            );
        }
    }

    public record EbookLoanResponse(
            Integer id,
            Integer ebookEditionId,
            String bookTitle,
            Integer userId,
            OffsetDateTime borrowedAt,
            OffsetDateTime loanExpiresAt,
            OffsetDateTime graceExpiresAt,
            OffsetDateTime returnedAt,
            boolean extended,
            OffsetDateTime extendedExpiresAt,
            EbookLoanStatus status
    ) {
        public static EbookLoanResponse from(EbookLoan loan) {
            return new EbookLoanResponse(
                    loan.getId(),
                    loan.getEbookEdition().getId(),
                    loan.getEbookEdition().getTitle().getName(),
                    loan.getUser().getId(),
                    loan.getBorrowedAt(),
                    loan.getLoanExpiresAt(),
                    loan.getGraceExpiresAt(),
                    loan.getReturnedAt(),
                    Boolean.TRUE.equals(loan.getExtended()),
                    loan.getExtendedExpiresAt(),
                    loan.getStatus()
            );
        }
    }
}
