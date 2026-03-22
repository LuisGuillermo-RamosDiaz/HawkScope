package com.hawkscope.backend.dto;

import java.time.LocalDateTime;

public record AgentPayloadDto(
    String version,
    String host,
    String ip,
    LocalDateTime timestamp,
    AgentResourcesDto resources
) {}
