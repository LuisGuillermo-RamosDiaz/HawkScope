package com.hawkscope.backend.controller;

import com.hawkscope.backend.service.DashboardService;
import com.hawkscope.backend.repository.OrganizationRepository;
import com.hawkscope.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final OrganizationRepository organizationRepository;
    private final JwtService jwtService;

    public DashboardController(DashboardService dashboardService, OrganizationRepository organizationRepository, JwtService jwtService) {
        this.dashboardService = dashboardService;
        this.organizationRepository = organizationRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Claims claims = jwtService.parseToken(token);
            UUID orgId = UUID.fromString(claims.get("org_id", String.class));
            return organizationRepository.findById(orgId)
                    .map(org -> ResponseEntity.ok(dashboardService.getDashboardSummary(org)))
                    .orElseGet(() -> ResponseEntity.status(404).build());
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
