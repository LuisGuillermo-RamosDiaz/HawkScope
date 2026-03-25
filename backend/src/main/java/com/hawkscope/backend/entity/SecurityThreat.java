package com.hawkscope.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "security_threats")
public class SecurityThreat {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "organization_id", nullable = false, length = 36)
    private String organizationId;

    @Column(name = "server_id", length = 36)
    private String serverId;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(nullable = false)
    private String severity;

    @Column(name = "source_ip", length = 45)
    private String sourceIp;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "monitoring";

    @Column(name = "attempt_count")
    private Integer attemptCount = 1;

    @Column(name = "auto_blocked")
    private Boolean autoBlocked = false;

    @Column(name = "detected_at", nullable = false)
    private LocalDateTime detectedAt = LocalDateTime.now();

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    // Getters
    public String getId() { return id; }
    public String getOrganizationId() { return organizationId; }
    public String getServerId() { return serverId; }
    public String getType() { return type; }
    public String getSeverity() { return severity; }
    public String getSourceIp() { return sourceIp; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public Integer getAttemptCount() { return attemptCount; }
    public Boolean getAutoBlocked() { return autoBlocked; }
    public LocalDateTime getDetectedAt() { return detectedAt; }
    public LocalDateTime getLastSeenAt() { return lastSeenAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
    public void setServerId(String serverId) { this.serverId = serverId; }
    public void setType(String type) { this.type = type; }
    public void setSeverity(String severity) { this.severity = severity; }
    public void setSourceIp(String sourceIp) { this.sourceIp = sourceIp; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(String status) { this.status = status; }
    public void setAttemptCount(Integer attemptCount) { this.attemptCount = attemptCount; }
    public void setAutoBlocked(Boolean autoBlocked) { this.autoBlocked = autoBlocked; }
    public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
}
