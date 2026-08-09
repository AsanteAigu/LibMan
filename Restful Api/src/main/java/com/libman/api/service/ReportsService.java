package com.libman.api.service;

import com.libman.api.web.dto.ReportDtos.Report;
import com.libman.api.web.dto.ReportDtos.ReportPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

/** Simple GROUP BY aggregates over the existing tables -- no new tables, matches
 * the brief's "placeholder charts" ask without inventing a reporting schema. */
@Service
@RequiredArgsConstructor
public class ReportsService {

    private final JdbcTemplate jdbcTemplate;

    public List<Report> list() {
        return List.of(loansPerMonth(), finesCollectedPerMonth());
    }

    private Report loansPerMonth() {
        List<ReportPoint> data = jdbcTemplate.query("""
                SELECT date_trunc('month', collected_at) AS month, COUNT(*) AS total
                FROM loans
                WHERE collected_at >= now() - INTERVAL '6 months'
                GROUP BY month
                ORDER BY month
                """,
                (rs, rowNum) -> new ReportPoint(monthLabel(rs.getTimestamp("month").toLocalDateTime().getMonthValue()),
                        rs.getLong("total")));
        return new Report("loans-per-month", "Loans issued per month",
                "Volume of loans collected across the last 6 months.", data);
    }

    private Report finesCollectedPerMonth() {
        List<ReportPoint> data = jdbcTemplate.query("""
                SELECT date_trunc('month', paid_at) AS month, COALESCE(SUM(amount), 0) AS total
                FROM payments
                WHERE paid_at >= now() - INTERVAL '6 months'
                GROUP BY month
                ORDER BY month
                """,
                (rs, rowNum) -> new ReportPoint(monthLabel(rs.getTimestamp("month").toLocalDateTime().getMonthValue()),
                        rs.getBigDecimal("total") != null ? rs.getBigDecimal("total") : BigDecimal.ZERO));
        return new Report("fines-collected", "Fines collected (GHS)",
                "Revenue from late fees, damage, and lost-item payments.", data);
    }

    private String monthLabel(int monthValue) {
        return java.time.Month.of(monthValue).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
    }
}
