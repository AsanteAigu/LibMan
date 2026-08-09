package com.libman.api.web.dto;

import java.util.List;

public record UserHistoryResponse(
        List<LoanResponse> loans,
        List<BorrowRequestResponse> requests,
        List<ChargeResponse> charges
) {
}
