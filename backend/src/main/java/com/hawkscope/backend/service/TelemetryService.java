package com.hawkscope.backend.service;

import com.hawkscope.backend.dto.AgentPayloadDto;
import com.hawkscope.backend.entity.Alert;
import com.hawkscope.backend.entity.Metric;
import com.hawkscope.backend.entity.Organization;
import com.hawkscope.backend.entity.Server;
import com.hawkscope.backend.repository.AlertRepository;
import com.hawkscope.backend.repository.MetricRepository;
import com.hawkscope.backend.repository.ServerRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class TelemetryService {

    private final ServerRepository serverRepository;
    private final MetricRepository metricRepository;
    private final AlertRepository alertRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuditService auditService;

    public TelemetryService(ServerRepository serverRepository, 
                            MetricRepository metricRepository,
                            AlertRepository alertRepository,
                            SimpMessagingTemplate messagingTemplate,
                            AuditService auditService) {
        this.serverRepository = serverRepository;
        this.metricRepository = metricRepository;
        this.alertRepository = alertRepository;
        this.messagingTemplate = messagingTemplate;
        this.auditService = auditService;
    }

    @Transactional
    public void processTelemetry(Organization org, AgentPayloadDto payload) {
        if (payload == null || payload.host() == null) {
            throw new IllegalArgumentException("Payload or hostname cannot be null");
        }

        Server server = serverRepository.findByOrganizationIdAndHostname(org.getId(), payload.host())
                .orElseGet(() -> {
                    Server newServer = new Server();
                    newServer.setOrganization(org);
                    newServer.setHostname(payload.host());
                    
                    // Audit Logging Requirement
                    auditService.log(
                        org.getId().toString(),
                        null,
                        "Nuevo servidor detectado",
                        "Server",
                        null,
                        payload.host(),
                        "{\"message\": \"Primera conexión recibida del agente en " + payload.host() + "\"}"
                    );
                    
                    return newServer;
                });

        server.setIpAddress(payload.ip());
        server.setAgentVersion(payload.version());
        server.setLastHeartbeat(LocalDateTime.now());

        // Actualizar métricas actuales del servidor
        if (payload.resources() != null) {
            if (payload.resources().cpuUsage() != null)
                server.setCpuUsage(payload.resources().cpuUsage());
            if (payload.resources().ramUsage() != null)
                server.setRamUsage(payload.resources().ramUsage());
            if (payload.resources().diskUsage() != null)
                server.setDiskUsage(payload.resources().diskUsage());
        }

        // Actualizar info del sistema
        if (payload.system() != null) {
            server.setOsName(payload.system().osName());
            server.setOsVersion(payload.system().osVersion());
            server.setOsArch(payload.system().osArch());
            if (payload.system().uptimeSeconds() != null)
                server.setUptimeSeconds(payload.system().uptimeSeconds());
        }

        // Actualizar IP interna si viene en el payload
        if (payload.ip() != null) {
            server.setIpInternal(payload.ip());
        }

        // Determinar estado del servidor basado en métricas
        String newStatus = "healthy";
        if (server.getCpuUsage() >= 90 || server.getRamUsage() >= 90) {
            newStatus = "critical";
        } else if (server.getCpuUsage() >= 75 || server.getRamUsage() >= 75) {
            newStatus = "warning";
        }
        server.setStatus(newStatus);
        
        server = serverRepository.save(server);

        if (payload.resources() != null && payload.resources().cpuUsage() != null && payload.resources().ramUsage() != null) {
            Metric metric = new Metric();
            metric.setServer(server);
            metric.setCpuUsage(payload.resources().cpuUsage());
            metric.setRamUsage(payload.resources().ramUsage());
            metric.setDiskUsage(payload.resources().diskUsage() != null ? payload.resources().diskUsage() : 0.0);
            
            metric.setTimestamp(payload.timestamp() != null ? LocalDateTime.ofInstant(payload.timestamp(), ZoneId.systemDefault()) : LocalDateTime.now());
            
            metricRepository.save(metric);

            checkForCpuAnomaly(org, server);

            messagingTemplate.convertAndSend("/topic/metrics", payload);
        }
    }

    private void checkForCpuAnomaly(Organization org, Server server) {
        List<Metric> recentMetrics = metricRepository.findTop100ByServer_IdOrderByTimestampDesc(server.getId());
        
        if (recentMetrics.size() >= 3) {
            boolean isCritical = true;
            for (int i = 0; i < 3; i++) {
                if (recentMetrics.get(i).getCpuUsage() < 90.0) {
                    isCritical = false;
                    break;
                }
            }

            if (isCritical) {
                List<Alert> activeAlerts = alertRepository.findByOrganizationIdAndStatus(org.getId(), "active");
                boolean alreadyAlerted = activeAlerts.stream()
                        .anyMatch(a -> a.getServer() != null && a.getServer().getId().equals(server.getId()) 
                                && a.getTitle().contains("CPU"));

                if (!alreadyAlerted) {
                    Alert alert = new Alert();
                    alert.setOrganization(org);
                    alert.setServer(server);
                    alert.setType("critical");
                    alert.setTitle("Sobrecarga Crítica de CPU (>90%)");
                    alert.setDescription("El servidor " + server.getHostname() + " ha reportado CPU > 90% repetitivamente durante los últimos reportes.");
                    alert.setStatus("active");
                    alertRepository.save(alert);

                    server.setStatus("critical");
                    serverRepository.save(server);

                    messagingTemplate.convertAndSend("/topic/alerts", alert);
                }
            }
        }
    }
}
