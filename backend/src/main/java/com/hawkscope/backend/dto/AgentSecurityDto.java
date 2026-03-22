package com.hawkscope.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public record AgentSecurityDto(
    @JsonProperty("active_connections") List<Map<String, Object>> activeConnections,
    @JsonProperty("logged_users")       List<String> loggedUsers
) {}
