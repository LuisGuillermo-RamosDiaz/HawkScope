package com.hawkscope.backend.controller;

import com.hawkscope.backend.entity.AuditLog;
import com.hawkscope.backend.repository.AuditLogRepository;
import com.hawkscope.backend.repository.UserRepository;
import com.hawkscope.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuditController(AuditLogRepository auditLogRepository,
                           UserRepository userRepository,
                           JwtService jwtService) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    private String getOrgId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtService.parseToken(token);
        return claims.get("org_id", String.class);
    }

    @GetMapping
    public ResponseEntity<?> getAuditLogs(
            @RequestHeader("Authorization") String authHeader) {
        String orgId = getOrgId(authHeader);
        List<AuditLog> logs = auditLogRepository.findByOrganizationIdOrderByTimestampDesc(orgId);

        List<Map<String, Object>> result = logs.stream().map(log -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", log.getId());
            m.put("timestamp", log.getTimestamp());
            m.put("action", log.getAction());
            m.put("resourceType", log.getResourceType());
            m.put("resourceName", log.getResourceName());
            m.put("ip", log.getIpAddress());
            m.put("status", log.getStatus());
            m.put("details", log.getDetails());
            m.put("errorMessage", log.getErrorMessage());

            // Resolve user email safely
            if (log.getUserId() != null && !log.getUserId().isEmpty()) {
                try {
                    userRepository.findById(UUID.fromString(log.getUserId()))
                        .ifPresentOrElse(
                            u -> m.put("user", u.getEmail()),
                            () -> m.put("user", "system")
                        );
                } catch (Exception e) {
                    m.put("user", "system");
                }
            } else {
                m.put("user", "system");
            }
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", result));
    }
}
