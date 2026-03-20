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
import java.util.List;

@Service
public class TelemetryService {

    private final ServerRepository serverRepository;
    private final MetricRepository metricRepository;
    private final AlertRepository alertRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TelemetryService(ServerRepository serverRepository, 
                            MetricRepository metricRepository,
                            AlertRepository alertRepository,
                            SimpMessagingTemplate messagingTemplate) {
        this.serverRepository = serverRepository;
        this.metricRepository = metricRepository;
        this.alertRepository = alertRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void processTelemetry(Organization org, AgentPayloadDto payload) {
        if (payload == null || payload.host() == null) {
            throw new IllegalArgumentException("Payload or hostname cannot be null");
        }

        // Buscar el servidor en la BD o crear uno nuevo auto-registrado
        Server server = serverRepository.findByOrganizationIdAndHostname(org.getId(), payload.host())
                .orElseGet(() -> {
                    Server newServer = new Server();
                    newServer.setOrganization(org);
                    newServer.setHostname(payload.host());
                    return newServer;
                });

        // Actualizar datos de latido y estado cada minuto que el agente habla
        server.setIpAddress(payload.ip());
        server.setAgentVersion(payload.version());
        // Si no está crítico, lo ponemos healthy. Si estaba crítico se queda así hasta resolver.
        if (!"critical".equals(server.getStatus())) {
            server.setStatus("healthy");
        }
        server.setLastHeartbeat(LocalDateTime.now());
        
        server = serverRepository.save(server);

        // Extraer métricas de recursos y registrarlas firmemente
        if (payload.resources() != null && payload.resources().cpu() != null && payload.resources().ram() != null) {
            Metric metric = new Metric();
            metric.setServer(server);
            metric.setCpuUsage(payload.resources().cpu());
            metric.setRamUsage(payload.resources().ram());
            metric.setDiskUsage(payload.resources().disk() != null ? payload.resources().disk() : 0.0);
            
            // Si el agente Python manda su propio reloj, lo respetamos, sino usamos hora del servidor
            metric.setTimestamp(payload.timestamp() != null ? payload.timestamp() : LocalDateTime.now());
            
            metricRepository.save(metric);

            // 1. Analizador SOC (Alerta si CPU > 90% sostenido)
            checkForCpuAnomaly(org, server);

            // 2. Emisión en Tiempo Real vía WebSocket
            // El frontend suscrito a /topic/metrics recibirá este objeto literalmente al instante
            messagingTemplate.convertAndSend("/topic/metrics", payload);
        }
    }

    private void checkForCpuAnomaly(Organization org, Server server) {
        // Evaluador heurístico ultra-rápido: Si las últimas 3 métricas seguidas exceden 90% CPU.
        List<Metric> recentMetrics = metricRepository.findTop100ByServerIdOrderByTimestampDesc(server.getId());
        
        if (recentMetrics.size() >= 3) {
            boolean isCritical = true;
            for (int i = 0; i < 3; i++) {
                if (recentMetrics.get(i).getCpuUsage() < 90.0) {
                    isCritical = false;
                    break;
                }
            }

            if (isCritical) {
                // Verificar que no hayamos creado ya una alerta activa por esto
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

                    // Notificar al Dashboard en vivo sobre nueva alerta
                    messagingTemplate.convertAndSend("/topic/alerts", alert);
                }
            }
        }
    }
}
