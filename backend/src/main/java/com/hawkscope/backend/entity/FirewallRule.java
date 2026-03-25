package com.hawkscope.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "firewall_rules")
public class FirewallRule {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "organization_id", nullable = false, length = 36)
    private String organizationId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 10)
    private String protocol;

    @Column(name = "source_ip_range", length = 100)
    private String sourceIpRange;

    @Column(nullable = false)
    private String action;

    @Column
    private Integer priority = 100;

    @Column
    private Boolean enabled = true;

    @Column(name = "hit_count")
    private Long hitCount = 0L;

    @Column(name = "last_hit_at")
    private LocalDateTime lastHitAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters
    public String getId() { return id; }
    public String getOrganizationId() { return organizationId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getProtocol() { return protocol; }
    public String getSourceIpRange() { return sourceIpRange; }
    public String getAction() { return action; }
    public Integer getPriority() { return priority; }
    public Boolean getEnabled() { return enabled; }
    public Long getHitCount() { return hitCount; }
    public LocalDateTime getLastHitAt() { return lastHitAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setProtocol(String protocol) { this.protocol = protocol; }
    public void setSourceIpRange(String sourceIpRange) { this.sourceIpRange = sourceIpRange; }
    public void setAction(String action) { this.action = action; }
    public void setPriority(Integer priority) { this.priority = priority; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public void setHitCount(Long hitCount) { this.hitCount = hitCount; }
    public void setLastHitAt(LocalDateTime lastHitAt) { this.lastHitAt = lastHitAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
