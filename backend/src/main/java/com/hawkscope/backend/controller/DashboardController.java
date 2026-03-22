package com.hawkscope.backend.controller;

import com.hawkscope.backend.service.DashboardService;
import com.hawkscope.backend.repository.OrganizationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final OrganizationRepository organizationRepository;

    public DashboardController(DashboardService dashboardService, OrganizationRepository organizationRepository) {
        this.dashboardService = dashboardService;
        this.organizationRepository = organizationRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestHeader(value = "X-API-KEY", required = true) String apiKey) {
        return organizationRepository.findByApiKey(apiKey)
                .map(org -> ResponseEntity.ok(dashboardService.getDashboardSummary(org)))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }
}
