package com.hawkscope.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AgentSystemDto(
    @JsonProperty("os_name")        String osName,
    @JsonProperty("os_version")     String osVersion,
    @JsonProperty("os_arch")        String osArch,
    @JsonProperty("uptime_seconds") Long uptimeSeconds
) {}
