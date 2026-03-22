package com.hawkscope.backend.controller;

import com.hawkscope.backend.entity.Metric;
import com.hawkscope.backend.entity.Server;
import com.hawkscope.backend.repository.AlertRepository;
import com.hawkscope.backend.repository.MetricRepository;
import com.hawkscope.backend.repository.OrganizationRepository;
import com.hawkscope.backend.repository.ServerRepository;
import com.hawkscope.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/metrics")
public class MetricsController {

    private final ServerRepository serverRepository;
    private final MetricRepository metricRepository;
    private final AlertRepository alertRepository;
    private final OrganizationRepository organizationRepository;
    private final JwtService jwtService;

    public MetricsController(ServerRepository serverRepository,
                              MetricRepository metricRepository,
                              AlertRepository alertRepository,
                              OrganizationRepository organizationRepository,
                              JwtService jwtService) {
        this.serverRepository = serverRepository;
        this.metricRepository = metricRepository;
        this.alertRepository = alertRepository;
        this.organizationRepository = organizationRepository;
        this.jwtService = jwtService;
    }

    private UUID getOrgId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Claims claims = jwtService.parseToken(token);
        return UUID.fromString(claims.get("org_id", String.class));
    }

    @GetMapping("/servers")
    public ResponseEntity<?> getServers(
            @RequestHeader("Authorization") String authHeader) {
        UUID orgId = getOrgId(authHeader);
        List<Server> servers = serverRepository.findByOrganizationId(orgId);
        List<Map<String, Object>> result = servers.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("hostname", s.getHostname());
            m.put("ip", s.getIpAddress());
            m.put("status", s.getStatus());
            m.put("cpu", s.getCpuUsage());
            m.put("ram", s.getRamUsage());
            m.put("disk", s.getDiskUsage());
            m.put("os", s.getOsName());
            m.put("agent_version", s.getAgentVersion());
            m.put("last_heartbeat", s.getLastHeartbeat());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", result));
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatest(
            @RequestHeader("Authorization") String authHeader) {
        UUID orgId = getOrgId(authHeader);
        List<Server> servers = serverRepository.findByOrganizationId(orgId);
        List<Map<String, Object>> result = servers.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("server_id", s.getId());
            m.put("hostname", s.getHostname());
            m.put("cpu", s.getCpuUsage());
            m.put("ram", s.getRamUsage());
            m.put("disk", s.getDiskUsage());
            m.put("status", s.getStatus());
            m.put("timestamp", s.getLastHeartbeat());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("data", result));
    }

    @GetMapping("/historical")
    public ResponseEntity<?> getHistorical(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "1h") String range,
            @RequestParam(required = false) String server_id) {
        UUID orgId = getOrgId(authHeader);
        List<Server> servers = serverRepository.findByOrganizationId(orgId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Server s : servers) {
            List<Metric> metrics = metricRepository
                .findTop100ByServer_IdOrderByTimestampDesc(s.getId());
            for (Metric metric : metrics) {
                Map<String, Object> m = new HashMap<>();
                m.put("server_id", s.getId());
                m.put("hostname", s.getHostname());
                m.put("cpu", metric.getCpuUsage());
                m.put("ram", metric.getRamUsage());
                m.put("disk", metric.getDiskUsage());
                m.put("timestamp", metric.getTimestamp());
                result.add(m);
            }
        }
        return ResponseEntity.ok(Map.of("data", result));
    }

    @GetMapping("/kpis")
    public ResponseEntity<?> getKpis(
            @RequestHeader("Authorization") String authHeader) {
        UUID orgId = getOrgId(authHeader);
        List<Server> servers = serverRepository.findByOrganizationId(orgId);
        
        long total    = servers.size();
        long healthy  = servers.stream().filter(s -> "healthy".equals(s.getStatus())).count();
        long warning  = servers.stream().filter(s -> "warning".equals(s.getStatus())).count();
        long critical = servers.stream().filter(s -> "critical".equals(s.getStatus())).count();
        long offline  = servers.stream().filter(s -> "offline".equals(s.getStatus())).count();
        long activeAlerts = alertRepository.findByOrganizationIdAndStatus(orgId, "active").size();
        
        double avgCpu = servers.stream()
            .mapToDouble(s -> s.getCpuUsage() != null ? s.getCpuUsage() : 0)
            .average().orElse(0);
        double avgRam = servers.stream()
            .mapToDouble(s -> s.getRamUsage() != null ? s.getRamUsage() : 0)
            .average().orElse(0);
        double uptime = total > 0 ? (double)(total - offline) / total * 100 : 100;
        
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalServers",   total);
        kpis.put("healthyServers", healthy);
        kpis.put("warningServers", warning);
        kpis.put("criticalServers", critical);
        kpis.put("offlineServers", offline);
        kpis.put("activeAlerts",   activeAlerts);
        kpis.put("avgCpu",         Math.round(avgCpu * 10.0) / 10.0);
        kpis.put("avgRam",         Math.round(avgRam * 10.0) / 10.0);
        kpis.put("availability",   Math.round(uptime * 10.0) / 10.0);
        
        return ResponseEntity.ok(kpis);
    }
}
