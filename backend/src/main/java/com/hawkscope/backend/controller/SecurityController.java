package com.hawkscope.backend.controller;

import com.hawkscope.backend.entity.FirewallRule;
import com.hawkscope.backend.entity.SecurityThreat;
import com.hawkscope.backend.entity.Vulnerability;
import com.hawkscope.backend.repository.FirewallRuleRepository;
import com.hawkscope.backend.repository.SecurityThreatRepository;
import com.hawkscope.backend.repository.VulnerabilityRepository;
import com.hawkscope.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/security")
public class SecurityController {

    private final SecurityThreatRepository threatRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final FirewallRuleRepository firewallRuleRepository;
    private final JwtService jwtService;

    public SecurityController(SecurityThreatRepository threatRepository,
                              VulnerabilityRepository vulnerabilityRepository,
                              FirewallRuleRepository firewallRuleRepository,
                              JwtService jwtService) {
        this.threatRepository = threatRepository;
        this.vulnerabilityRepository = vulnerabilityRepository;
        this.firewallRuleRepository = firewallRuleRepository;
        this.jwtService = jwtService;
    }

    private String getOrgId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtService.parseToken(token);
        return claims.get("org_id", String.class);
    }

    @GetMapping("/threats")
    public ResponseEntity<?> getThreats(
            @RequestHeader("Authorization") String authHeader) {
        String orgId = getOrgId(authHeader);
        List<SecurityThreat> threats = threatRepository.findByOrganizationIdOrderByDetectedAtDesc(orgId);

        List<Map<String, Object>> result = threats.stream().map(t -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", t.getId());
            m.put("type", t.getType());
            m.put("severity", t.getSeverity());
            m.put("sourceIp", t.getSourceIp());
            m.put("description", t.getDescription());
            m.put("status", t.getStatus());
            m.put("attemptCount", t.getAttemptCount());
            m.put("detectedAt", t.getDetectedAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", result));
    }

    @GetMapping("/vulnerabilities")
    public ResponseEntity<?> getVulnerabilities(
            @RequestHeader("Authorization") String authHeader) {
        String orgId = getOrgId(authHeader);
        List<Vulnerability> vulns = vulnerabilityRepository.findByOrganizationIdOrderByDetectedAtDesc(orgId);

        List<Map<String, Object>> result = vulns.stream().map(v -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", v.getId());
            m.put("cveId", v.getCveId());
            m.put("componentName", v.getComponentName());
            m.put("componentType", v.getComponentType());
            m.put("severity", v.getSeverity());
            m.put("description", v.getDescription());
            m.put("cvssScore", v.getCvssScore());
            m.put("status", v.getStatus());
            m.put("detectedAt", v.getDetectedAt());
            m.put("patchedAt", v.getPatchedAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", result));
    }

    @GetMapping("/firewall")
    public ResponseEntity<?> getFirewallRules(
            @RequestHeader("Authorization") String authHeader) {
        String orgId = getOrgId(authHeader);
        List<FirewallRule> rules = firewallRuleRepository.findByOrganizationIdOrderByPriorityAsc(orgId);

        List<Map<String, Object>> result = rules.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("name", r.getName());
            m.put("description", r.getDescription());
            m.put("protocol", r.getProtocol());
            m.put("sourceIpRange", r.getSourceIpRange());
            m.put("action", r.getAction());
            m.put("priority", r.getPriority());
            m.put("enabled", r.getEnabled());
            m.put("hitCount", r.getHitCount());
            m.put("lastHitAt", r.getLastHitAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("data", result));
    }
}
