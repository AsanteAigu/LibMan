package com.libman.api.web.dto;

import java.util.List;

public class ReportDtos {

    public record ReportPoint(String label, Number value) {
    }

    public record Report(String id, String title, String description, List<ReportPoint> data) {
    }
}
