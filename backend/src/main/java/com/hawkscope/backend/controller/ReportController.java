package com.hawkscope.backend.controller;

import com.hawkscope.backend.service.JwtService;
import com.hawkscope.backend.service.ReportService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;
    private final JwtService jwtService;

    public ReportController(ReportService reportService, JwtService jwtService) {
        this.reportService = reportService;
        this.jwtService = jwtService;
    }

    private UUID getOrgId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtService.parseToken(token);
        return UUID.fromString(claims.get("org_id", String.class));
    }

    @GetMapping("/servers/export")
    public ResponseEntity<?> exportServerReport(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID orgId = getOrgId(authHeader);
            String url = reportService.generateAndUploadServerReport(orgId);
            return ResponseEntity.ok(Map.of("message", "Report generated successfully", "url", url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error generating report: " + e.getMessage()));
        }
    }
}
