package com.libman.api.web.dto;

import java.math.BigDecimal;

public class DashboardDtos {

    public record StudentDashboardResponse(
            long activeLoans, long reservedBooks, long overdueBooks, BigDecimal outstandingCharges
    ) {
    }

    public record LibrarianDashboardResponse(
            long pendingRequests,
            long activeLoans,
            long returnedToday,
            long reservationsWaiting,
            long overdueBooks,
            long inventoryAvailable,
            long inventoryTotal
    ) {
    }
}
