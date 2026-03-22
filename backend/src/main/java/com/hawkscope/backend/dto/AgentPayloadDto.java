package com.hawkscope.backend.dto;

import java.time.Instant;

public record AgentPayloadDto(
    String version,
    String host,
    String ip,
    Instant timestamp,
    AgentSystemDto system,
    AgentResourcesDto resources,
    AgentSecurityDto security
) {}
