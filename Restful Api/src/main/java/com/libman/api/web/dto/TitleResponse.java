package com.libman.api.web.dto;

import com.libman.api.domain.Copy;
import com.libman.api.domain.Title;
import com.libman.api.domain.enums.CopyStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record TitleResponse(
        Integer id,
        String name,
        String author,
        BigDecimal replacementCost,
        boolean hasEbook,
        long availableCopies,
        List<CopyResponse> copies,
        OffsetDateTime createdAt,
        String coverImageUrl
) {
    public static TitleResponse from(Title title, List<Copy> copies, boolean hasEbook) {
        long available = copies.stream().filter(c -> c.getStatus() == CopyStatus.available).count();
        return new TitleResponse(
                title.getId(),
                title.getName(),
                title.getAuthor(),
                title.getReplacementCost(),
                hasEbook,
                available,
                copies.stream().map(CopyResponse::from).toList(),
                title.getCreatedAt(),
                title.getCoverImageUrl()
        );
    }
}
