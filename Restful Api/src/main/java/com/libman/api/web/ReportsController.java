package com.libman.api.web;

import com.libman.api.service.ReportsService;
import com.libman.api.web.dto.ReportDtos.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LIBRARIAN')")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping
    public List<Report> list() {
        return reportsService.list();
    }
}
