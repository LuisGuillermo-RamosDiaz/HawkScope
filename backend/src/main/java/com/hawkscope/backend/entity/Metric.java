package com.hawkscope.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "metrics")
public class Metric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @Column(name = "cpu_usage", nullable = false)
    private Double cpuUsage;

    @Column(name = "ram_usage", nullable = false)
    private Double ramUsage;

    @Column(name = "disk_usage", nullable = false)
    private Double diskUsage;

    @Column(name = "network_bytes_in")
    private Long networkBytesIn = 0L;

    @Column(name = "network_bytes_out")
    private Long networkBytesOut = 0L;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Server getServer() { return server; }
    public void setServer(Server server) { this.server = server; }
    public Double getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(Double cpuUsage) { this.cpuUsage = cpuUsage; }
    public Double getRamUsage() { return ramUsage; }
    public void setRamUsage(Double ramUsage) { this.ramUsage = ramUsage; }
    public Double getDiskUsage() { return diskUsage; }
    public void setDiskUsage(Double diskUsage) { this.diskUsage = diskUsage; }
    public Long getNetworkBytesIn() { return networkBytesIn; }
    public void setNetworkBytesIn(Long networkBytesIn) { this.networkBytesIn = networkBytesIn; }
    public Long getNetworkBytesOut() { return networkBytesOut; }
    public void setNetworkBytesOut(Long networkBytesOut) { this.networkBytesOut = networkBytesOut; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
