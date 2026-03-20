package com.hawkscope.backend.dto;

public record AgentResourcesDto(
    Double cpu,
    Double ram,
    Double disk
) {}
