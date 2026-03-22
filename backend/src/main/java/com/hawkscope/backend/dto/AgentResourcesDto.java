package com.hawkscope.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AgentResourcesDto(
    @JsonProperty("cpu_usage")     Double cpuUsage,
    @JsonProperty("ram_usage")     Double ramUsage,
    @JsonProperty("disk_usage")    Double diskUsage,

    @JsonProperty("network_bytes_in")  Long networkBytesIn,
    @JsonProperty("network_bytes_out") Long networkBytesOut,

    @JsonProperty("processes_count")   Integer processesCount,
    @JsonProperty("tcp_connections")   Integer tcpConnections,
    @JsonProperty("established_connections") Integer establishedConnections,

    @JsonProperty("cpu_temp_celsius")  Double cpuTempCelsius,
    @JsonProperty("memory_available_mb") Long memoryAvailableMb,
    @JsonProperty("swap_used_mb")      Long swapUsedMb
) {}
