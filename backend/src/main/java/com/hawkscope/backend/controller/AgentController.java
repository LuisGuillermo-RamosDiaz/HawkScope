package com.hawkscope.backend.controller;

import com.hawkscope.backend.dto.AgentPayloadDto;
import com.hawkscope.backend.repository.OrganizationRepository;
import com.hawkscope.backend.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentController {

    private final TelemetryService telemetryService;
    private final OrganizationRepository organizationRepository;

    public AgentController(TelemetryService telemetryService, OrganizationRepository organizationRepository) {
        this.telemetryService = telemetryService;
        this.organizationRepository = organizationRepository;
    }

    @PostMapping("/metrics")
    public ResponseEntity<?> receiveMetrics(
            @RequestHeader(value = "X-API-KEY", required = true) String apiKey,
            @RequestBody AgentPayloadDto payload) {
        
        // Autenticar la organización proveedora de la API Key
        return organizationRepository.findByApiKey(apiKey)
                .map(org -> {
                    telemetryService.processTelemetry(org, payload);
                    return ResponseEntity.ok("Métricas procesadas y almacenadas con éxito.");
                })
                .orElseGet(() -> ResponseEntity.status(401).body("API Key Invalida"));
    }
}
