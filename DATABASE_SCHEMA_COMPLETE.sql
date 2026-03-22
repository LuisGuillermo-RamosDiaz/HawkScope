-- ==================================================================================
-- HawkScope SOC Platform v2.0 - Complete Database Schema
-- Database: MySQL 8.0+
-- Purpose: Multi-tenant monitoring and security incident detection platform
-- ==================================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS hawkscope_db;
USE hawkscope_db;

-- ==================================================================================
-- 1. ORGANIZATIONS TABLE
-- Multi-tenant support - Each organization is completely isolated
-- ==================================================================================

CREATE TABLE organizations (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID primary key',
  name VARCHAR(255) NOT NULL COMMENT 'Organization name',
  industry VARCHAR(100) COMMENT 'Industry sector (IT, Healthcare, Finance, etc)',
  company_size VARCHAR(20) COMMENT 'Size: small, medium, large, enterprise',
  subscription_tier VARCHAR(50) DEFAULT 'pro' COMMENT 'free, pro, enterprise',
  api_key VARCHAR(255) UNIQUE COMMENT 'Master API key for organization agents',
  max_servers INT DEFAULT 50 COMMENT 'Maximum servers allowed in subscription',
  max_users INT DEFAULT 10 COMMENT 'Maximum users allowed in subscription',
  status ENUM('active', 'suspended', 'trial', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',

  INDEX idx_status (status),
  INDEX idx_api_key (api_key)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Organizations/Companies';

-- ==================================================================================
-- 2. USERS TABLE
-- Employees/members of organizations
-- ==================================================================================

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL COMMENT 'Unique per organization',
  password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(255) COMMENT 'Denormalized for faster queries',
  role ENUM('admin', 'operator', 'viewer') DEFAULT 'viewer' COMMENT 'RBAC role',
  status ENUM('active', 'inactive', 'invited', 'pending_activation') DEFAULT 'invited',

  -- Two Factor Authentication
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255) NULL COMMENT 'TOTP secret',
  two_factor_verified_at TIMESTAMP NULL,

  -- Audit fields
  last_login_at TIMESTAMP NULL,
  last_login_ip VARCHAR(45) NULL,
  login_failure_count INT DEFAULT 0 COMMENT 'For brute force detection',
  login_failure_last_at TIMESTAMP NULL,

  -- Notifications preferences
  notify_critical_alerts BOOLEAN DEFAULT TRUE,
  notify_daily_digest BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT fk_org_users FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT unique_org_email UNIQUE (organization_id, email),
  INDEX idx_organization_id (organization_id),
  INDEX idx_email (email),
  INDEX idx_status (status)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'System users';

-- ==================================================================================
-- 3. SESSIONS TABLE
-- Track active user sessions and tokens
-- ==================================================================================

CREATE TABLE sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(512) NOT NULL UNIQUE COMMENT 'JWT token',
  refresh_token VARCHAR(512) NULL COMMENT 'Refresh token for token rotation',

  -- Client information
  ip_address VARCHAR(45) NOT NULL COMMENT 'IPv4 or IPv6',
  user_agent TEXT COMMENT 'Browser/Client user agent',
  device_type VARCHAR(50) COMMENT 'mobile, tablet, desktop',

  -- Token metadata
  expires_at TIMESTAMP NOT NULL COMMENT 'JWT expiration time',
  revoked_at TIMESTAMP NULL COMMENT 'Manual token revocation',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Active sessions and tokens';

-- ==================================================================================
-- 4. SERVERS TABLE
-- Monitored servers/nodes in infrastructure
-- ==================================================================================

CREATE TABLE servers (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  hostname VARCHAR(255) NOT NULL,

  -- Network information
  ip_address VARCHAR(45) COMMENT 'External/Public IP',
  ip_internal VARCHAR(45) COMMENT 'Internal/Private IP',
  ip_gateway VARCHAR(45),

  -- Server details
  os_name VARCHAR(100) COMMENT 'Ubuntu, Debian, CentOS, Windows, etc',
  os_version VARCHAR(100),
  os_arch VARCHAR(20) COMMENT 'x86_64, arm64, etc',

  -- Location
  region VARCHAR(100) COMMENT 'AWS region, datacenter, etc',
  datacenter VARCHAR(100),

  -- Current status and metrics
  status ENUM('healthy', 'warning', 'critical', 'offline', 'unknown') DEFAULT 'unknown',
  cpu_usage DECIMAL(5,2) DEFAULT 0 COMMENT 'Percentage 0-100',
  ram_usage DECIMAL(5,2) DEFAULT 0 COMMENT 'Percentage 0-100',
  disk_usage DECIMAL(5,2) DEFAULT 0 COMMENT 'Percentage 0-100',

  -- Uptime and heartbeat
  uptime_seconds BIGINT DEFAULT 0 COMMENT 'System uptime in seconds',

  -- Agent information
  agent_version VARCHAR(20),
  agent_installed_at TIMESTAMP NULL,
  agent_api_key VARCHAR(255) UNIQUE COMMENT 'API key for this agent',

  -- Heartbeat tracking for offline detection
  last_heartbeat TIMESTAMP NULL,
  last_heartbeat_at TIMESTAMP NULL COMMENT 'More precise timestamp',
  heartbeat_interval_seconds INT DEFAULT 60,

  -- Metadata
  enabled BOOLEAN DEFAULT TRUE,
  environment VARCHAR(50) COMMENT 'production, staging, development, test',
  owner VARCHAR(100),
  tags JSON COMMENT 'Custom tags for organization',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT fk_server_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT unique_org_hostname UNIQUE (organization_id, hostname),
  INDEX idx_organization_id (organization_id),
  INDEX idx_status (status),
  INDEX idx_last_heartbeat (last_heartbeat),
  INDEX idx_environment (environment),
  INDEX idx_os_name (os_name)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Monitored servers/infrastructure nodes';

-- ==================================================================================
-- 5. METRICS TABLE
-- Time-series metrics from servers (CPU, RAM, Disk, Network)
-- IMPORTANT: Should be partitioned by month in production for performance
-- ==================================================================================

CREATE TABLE metrics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  server_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL COMMENT 'Denormalized for faster queries',

  -- Resource metrics
  cpu_usage DECIMAL(5,2) NOT NULL COMMENT 'CPU percentage 0-100',
  ram_usage DECIMAL(5,2) NOT NULL COMMENT 'Memory percentage 0-100',
  disk_usage DECIMAL(5,2) NOT NULL COMMENT 'Disk percentage 0-100',

  -- Network metrics
  network_bytes_in BIGINT DEFAULT 0 COMMENT 'Bytes received',
  network_bytes_out BIGINT DEFAULT 0 COMMENT 'Bytes transmitted',
  network_packets_in BIGINT DEFAULT 0,
  network_packets_out BIGINT DEFAULT 0,
  network_errors_in INT DEFAULT 0,
  network_errors_out INT DEFAULT 0,

  -- Process and connection metrics
  processes_count INT DEFAULT 0 COMMENT 'Total running processes',
  tcp_connections INT DEFAULT 0 COMMENT 'Total TCP connections',
  established_connections INT DEFAULT 0 COMMENT 'Established TCP connections',

  -- Application metrics
  response_time_ms INT DEFAULT 0 COMMENT 'Average response time in milliseconds',
  request_count INT DEFAULT 0 COMMENT 'Requests in the interval',
  error_count INT DEFAULT 0 COMMENT 'Failed requests in the interval',

  -- Temperature and other hardware
  cpu_temp_celsius DECIMAL(5,2) NULL,
  memory_available_mb BIGINT DEFAULT 0,
  swap_used_mb BIGINT DEFAULT 0,

  -- Timestamp for time-series
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_metrics_server FOREIGN KEY (server_id) REFERENCES servers(id),
  CONSTRAINT fk_metrics_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_server_timestamp (server_id, timestamp),
  INDEX idx_organization_timestamp (organization_id, timestamp),
  INDEX idx_timestamp (timestamp)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Time-series metrics';

-- Alternative: For very high volume, consider TimescaleDB or InfluxDB
-- CREATE TABLE metrics_hypertable (
--   LIKE metrics INCLUDING ALL
-- ) USING timescaledb;
-- SELECT create_hypertable('metrics_hypertable', 'timestamp');

-- ==================================================================================
-- 6. ALERTS TABLE
-- Generated alerts from threshold violations or anomalies
-- ==================================================================================

CREATE TABLE alerts (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  server_id CHAR(36) NULL COMMENT 'NULL if organization-wide alert',
  deleted_at TIMESTAMP NULL,

  -- Alert details
  type ENUM('critical', 'warning', 'info') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT COMMENT 'Full alert message',

  -- Alert status
  status ENUM('active', 'acknowledged', 'resolved', 'silenced') DEFAULT 'active',

  -- Threshold details (for metric-based alerts)
  metric_type VARCHAR(100) COMMENT 'cpu, ram, disk, network, response_time, etc',
  threshold_value DECIMAL(10,2) COMMENT 'Configured threshold',
  current_value DECIMAL(10,2) COMMENT 'Current value that triggered alert',

  -- Acknowledgment
  acknowledged_at TIMESTAMP NULL,
  acknowledged_by CHAR(36) NULL COMMENT 'User who acknowledged',

  -- Resolution
  resolved_at TIMESTAMP NULL,
  resolved_by CHAR(36) NULL COMMENT 'User who resolved',
  resolution_notes TEXT,

  -- Automation
  auto_resolved_at TIMESTAMP NULL COMMENT 'Automatically resolved after condition cleared',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_alert_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_alert_server FOREIGN KEY (server_id) REFERENCES servers(id),
  CONSTRAINT fk_alert_ack_user FOREIGN KEY (acknowledged_by) REFERENCES users(id),
  CONSTRAINT fk_alert_res_user FOREIGN KEY (resolved_by) REFERENCES users(id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_server_id (server_id),
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Generated alerts';

-- ==================================================================================
-- 7. AUDIT_LOGS TABLE
-- Comprehensive audit trail of all system actions
-- ==================================================================================

CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL COMMENT 'NULL for system-generated actions',

  -- Action details
  action VARCHAR(100) NOT NULL COMMENT 'LOGIN, LOGOUT, CREATE, UPDATE, DELETE, DEPLOY, CONFIGURE, etc',
  resource_type VARCHAR(100) COMMENT 'users, servers, rules, alerts, settings, etc',
  resource_id VARCHAR(255) NULL COMMENT 'ID of affected resource',
  resource_name VARCHAR(255) COMMENT 'Name of affected resource for readability',

  -- Request details
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NULL,

  -- Result
  status ENUM('success', 'warning', 'critical', 'failure') DEFAULT 'success',
  error_message TEXT NULL COMMENT 'If action failed',

  -- Change tracking
  changes JSON COMMENT 'Before/after values for audit trail',
  details JSON COMMENT 'Additional context',

  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_audit_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_org_timestamp (organization_id, timestamp)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Audit trail of all actions';

-- ==================================================================================
-- 8. SECURITY_THREATS TABLE
-- Detected security threats and malicious activities
-- ==================================================================================

CREATE TABLE security_threats (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  server_id CHAR(36) NULL,

  -- Threat classification
  type VARCHAR(100) NOT NULL COMMENT 'Brute Force, SQL Injection, Port Scan, DDoS, XSS, Malware, etc',
  severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,

  -- Threat source and target
  source_ip VARCHAR(45) COMMENT 'Attacker IP',
  source_port INT,
  target_port INT COMMENT 'Port under attack',
  protocol VARCHAR(10) COMMENT 'TCP, UDP, ICMP, etc',

  -- Threat details
  description TEXT,
  attack_vector VARCHAR(100) COMMENT 'How the attack is performed',

  -- Status and response
  status ENUM('blocked', 'mitigated', 'monitoring', 'under_investigation') DEFAULT 'monitoring',
  attempt_count INT DEFAULT 1 COMMENT 'Number of attack attempts',

  -- Automatic response
  auto_blocked BOOLEAN DEFAULT FALSE,
  blocked_at TIMESTAMP NULL COMMENT 'When it was automatically blocked',

  -- User response
  responded_by CHAR(36) NULL COMMENT 'User who responded to threat',
  responded_at TIMESTAMP NULL,
  response_action VARCHAR(255) COMMENT 'What action was taken',

  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP NULL,

  CONSTRAINT fk_threat_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_threat_server FOREIGN KEY (server_id) REFERENCES servers(id),
  CONSTRAINT fk_threat_user FOREIGN KEY (responded_by) REFERENCES users(id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_detected_at (detected_at),
  INDEX idx_source_ip (source_ip)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Detected security threats';

-- ==================================================================================
-- 9. VULNERABILITIES TABLE
-- CVEs and vulnerabilities found in infrastructure
-- ==================================================================================

CREATE TABLE vulnerabilities (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  server_id CHAR(36) NULL COMMENT 'NULL for organization-wide vulnerabilities',

  -- CVE Information
  cve_id VARCHAR(50) UNIQUE COMMENT 'CVE-YYYY-XXXXX',
  cve_url VARCHAR(500),

  -- Vulnerable component
  component_name VARCHAR(255) NOT NULL COMMENT 'OpenSSL, nginx, PostgreSQL, etc',
  component_type VARCHAR(100) COMMENT 'library, application, os, firmware, etc',
  current_version VARCHAR(100),
  vulnerable_versions VARCHAR(500) COMMENT 'Affected version range',
  patch_available_version VARCHAR(100),

  -- Vulnerability details
  severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  description TEXT,
  cvss_score DECIMAL(3,1) COMMENT 'CVSS v3 score 0-10',

  -- Status and patching
  status ENUM('patched', 'pending', 'monitoring', 'wont_patch') DEFAULT 'pending',
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  patched_at TIMESTAMP NULL,

  -- Remediation
  remediation_notes TEXT,
  remediation_by CHAR(36) NULL COMMENT 'User responsible',

  CONSTRAINT fk_vuln_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_vuln_server FOREIGN KEY (server_id) REFERENCES servers(id),
  CONSTRAINT fk_vuln_user FOREIGN KEY (remediation_by) REFERENCES users(id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_severity (severity),
  INDEX idx_cve_id (cve_id),
  INDEX idx_detected_at (detected_at)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Vulnerabilities and CVEs';

-- ==================================================================================
-- 10. FIREWALL_RULES TABLE
-- Network firewall rules configuration and hits
-- ==================================================================================

CREATE TABLE firewall_rules (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,

  -- Rule identification
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_group VARCHAR(100) COMMENT 'For organizing rules',

  -- Network details
  protocol VARCHAR(10) COMMENT 'TCP, UDP, ICMP, ALL',
  port_from INT COMMENT 'Port range from',
  port_to INT COMMENT 'Port range to',
  source_ip_range VARCHAR(100) COMMENT 'CIDR notation',
  destination_ip_range VARCHAR(100) COMMENT 'CIDR notation',

  -- Direction (if applicable)
  direction ENUM('inbound', 'outbound', 'both') DEFAULT 'both',

  -- Action
  action ENUM('allow', 'deny', 'rate_limit', 'alert') NOT NULL,

  -- Configuration
  priority INT DEFAULT 100 COMMENT 'Lower = higher priority',
  enabled BOOLEAN DEFAULT TRUE,
  stateful BOOLEAN DEFAULT TRUE,

  -- Performance tracking
  hit_count BIGINT DEFAULT 0 COMMENT 'How many times this rule was matched',
  last_hit_at TIMESTAMP NULL,
  bytes_matched BIGINT DEFAULT 0,
  packets_matched BIGINT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_rule_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_enabled (enabled),
  INDEX idx_priority (priority),
  INDEX idx_action (action)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Firewall rules';

-- ==================================================================================
-- 11. NOTIFICATIONS TABLE
-- User notifications and alerts
-- ==================================================================================

CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,

  -- Notification content
  type ENUM('critical', 'warning', 'success', 'info') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Related resources
  related_alert_id CHAR(36) NULL COMMENT 'Link to alert if applicable',
  related_threat_id CHAR(36) NULL COMMENT 'Link to threat if applicable',

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,

  -- Action
  action_url VARCHAR(500) COMMENT 'URL to navigate to on action',
  action_label VARCHAR(100) COMMENT 'Button label for action',

  -- Delivery
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL COMMENT 'Auto-archive old notifications',

  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_notif_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_notif_alert FOREIGN KEY (related_alert_id) REFERENCES alerts(id),
  CONSTRAINT fk_notif_threat FOREIGN KEY (related_threat_id) REFERENCES security_threats(id),
  INDEX idx_user_id (user_id),
  INDEX idx_read_created (is_read, created_at),
  INDEX idx_created_at (created_at)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'User notifications';

-- ==================================================================================
-- 12. SECURITY_EVENTS TABLE
-- Raw security events from agents (connections, processes, logins, etc)
-- ==================================================================================

CREATE TABLE security_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  server_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,

  -- Event classification
  event_type VARCHAR(100) NOT NULL COMMENT 'connection, process, user_login, file_access, service_change, etc',
  severity VARCHAR(20) COMMENT 'low, medium, high, critical',

  -- Source and destination
  source_ip VARCHAR(45),
  source_port INT,
  destination_ip VARCHAR(45),
  destination_port INT,

  -- Process information
  process_name VARCHAR(255),
  process_pid INT,
  process_parent_pid INT,
  process_user VARCHAR(100),

  -- User information
  user_name VARCHAR(100),
  user_id_local INT COMMENT 'Local UID on the server',

  -- Details
  action VARCHAR(100) COMMENT 'connect, bind, listen, create, delete, modify, etc',
  details TEXT COMMENT 'Additional event information',
  raw_data JSON COMMENT 'Full raw event from agent',

  -- Status
  processed BOOLEAN DEFAULT FALSE COMMENT 'Has been analyzed for threats',
  threat_detected BOOLEAN DEFAULT FALSE,
  related_threat_id CHAR(36) NULL,

  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_event_server FOREIGN KEY (server_id) REFERENCES servers(id),
  CONSTRAINT fk_event_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_event_threat FOREIGN KEY (related_threat_id) REFERENCES security_threats(id),
  INDEX idx_server_timestamp (server_id, timestamp),
  INDEX idx_org_timestamp (organization_id, timestamp),
  INDEX idx_event_type (event_type),
  INDEX idx_severity (severity),
  INDEX idx_processed (processed)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Raw security events from agents';

-- ==================================================================================
-- 13. BASELINE_METRICS TABLE
-- Store normal baselines for anomaly detection
-- ==================================================================================

CREATE TABLE baseline_metrics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  server_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,

  -- Time period
  hour_of_day INT COMMENT '0-23',
  day_of_week INT COMMENT '0-6 (Sunday-Saturday)',
  week_type VARCHAR(20) COMMENT 'weekday, weekend, holiday',

  -- Baseline statistics
  cpu_avg DECIMAL(5,2),
  cpu_p95 DECIMAL(5,2) COMMENT '95th percentile',
  cpu_p99 DECIMAL(5,2) COMMENT '99th percentile',

  ram_avg DECIMAL(5,2),
  ram_p95 DECIMAL(5,2),
  ram_p99 DECIMAL(5,2),

  network_bytes_in_avg BIGINT,
  network_bytes_out_avg BIGINT,

  request_count_avg INT,
  response_time_avg INT,

  samples_count INT COMMENT 'How many measurements this baseline is based on',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_baseline_server FOREIGN KEY (server_id) REFERENCES servers(id),
  CONSTRAINT fk_baseline_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  INDEX idx_server_id (server_id),
  INDEX idx_day_hour (day_of_week, hour_of_day)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Baseline metrics for anomaly detection';

-- ==================================================================================
-- 14. API_KEYS TABLE
-- For programmatic access and agent authentication
-- ==================================================================================

CREATE TABLE api_keys (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL COMMENT 'NULL for organization-level keys',

  name VARCHAR(255) NOT NULL,
  description TEXT,

  key_hash VARCHAR(255) NOT NULL UNIQUE COMMENT 'SHA256 hash of the actual key',
  key_prefix VARCHAR(20) COMMENT 'First 20 chars for display',

  -- Permissions
  scopes JSON COMMENT '["metrics:write", "servers:read", etc]',
  permissions VARCHAR(255) COMMENT 'Comma-separated: agent, api_full, api_read',

  -- Limits
  rate_limit_per_minute INT DEFAULT 1000,

  -- Status
  enabled BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL COMMENT 'Optional expiration',

  CONSTRAINT fk_apikey_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_apikey_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_enabled (enabled)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'API keys for external integrations';

-- ==================================================================================
-- VIEWS - Useful queries for common operations
-- ==================================================================================

-- Dashboard KPIs View
CREATE VIEW dashboard_kpis AS
SELECT
  o.id as organization_id,
  COUNT(DISTINCT s.id) as total_servers,
  SUM(CASE WHEN s.status = 'healthy' THEN 1 ELSE 0 END) as healthy_servers,
  SUM(CASE WHEN s.status = 'warning' THEN 1 ELSE 0 END) as warning_servers,
  SUM(CASE WHEN s.status = 'critical' THEN 1 ELSE 0 END) as critical_servers,
  SUM(CASE WHEN s.status = 'offline' THEN 1 ELSE 0 END) as offline_servers,
  COUNT(DISTINCT a.id) as active_alerts,
  AVG(s.cpu_usage) as avg_cpu,
  AVG(s.ram_usage) as avg_ram,
  AVG(s.disk_usage) as avg_disk
FROM organizations o
LEFT JOIN servers s ON o.id = s.organization_id AND s.deleted_at IS NULL
LEFT JOIN alerts a ON o.id = a.organization_id AND a.status = 'active' AND a.deleted_at IS NULL
GROUP BY o.id;

-- Active Threats View
CREATE VIEW active_threats_summary AS
SELECT organization_id, severity, COUNT(*) as threat_count
FROM security_threats
WHERE status IN ('blocked', 'mitigated', 'monitoring')
GROUP BY organization_id, severity;

-- Recent Audit Events View
CREATE VIEW recent_audit_events AS
SELECT organization_id, user_id, action, resource_type, status, timestamp
FROM audit_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY timestamp DESC;


-- ==================================================================================
-- STORED PROCEDURES
-- ==================================================================================

DELIMITER //

-- Procedure to calculate server status based on metrics
CREATE PROCEDURE update_server_status(IN server_uuid CHAR(36))
BEGIN
  DECLARE cpu_val DECIMAL(5,2);
  DECLARE ram_val DECIMAL(5,2);
  DECLARE new_status VARCHAR(20);

  -- Get latest metrics
  SELECT cpu_usage, ram_usage INTO cpu_val, ram_val
  FROM metrics
  WHERE server_id = server_uuid
  ORDER BY timestamp DESC
  LIMIT 1;

  -- Determine status
  IF cpu_val IS NULL THEN
    SET new_status = 'offline';
  ELSEIF cpu_val >= 90 OR ram_val >= 90 THEN
    SET new_status = 'critical';
  ELSEIF cpu_val >= 75 OR ram_val >= 75 THEN
    SET new_status = 'warning';
  ELSE
    SET new_status = 'healthy';
  END IF;

  -- Update server
  UPDATE servers SET status = new_status WHERE id = server_uuid;
END //

-- Procedure to cleanup old data
CREATE PROCEDURE cleanup_old_data(IN days_to_keep INT)
BEGIN
  -- Delete old metrics (keep 90 days by default)
  DELETE FROM metrics
  WHERE timestamp < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);

  -- Delete old security events (keep 30 days)
  DELETE FROM security_events
  WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);

  -- Delete old notifications (keep 7 days)
  DELETE FROM notifications
  WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND is_read = TRUE;
END //

DELIMITER ;

-- ==================================================================================
-- INITIAL DATA
-- ==================================================================================

-- Insert sample organization
INSERT INTO organizations (id, name, industry, company_size, subscription_tier, api_key, status)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'HawkScope Demo', 'Technology', 'large', 'pro', 'sk_demo_1234567890', 'active');

-- Insert sample users
INSERT INTO users (id, organization_id, email, password_hash, full_name, role, status, created_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440000',
 'admin@hawkscope.io',
 '$2b$12$LJ3m5Rs1GK0sR1KhMer0F.YnxHzA3vH3hR3x3qA8X1v5R8nB3gD5w',
 'Admin User', 'admin', 'active', NOW()),

 ('660e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440000',
 'operator@hawkscope.io',
 '$2b$12$PQ7k5Ws3HN2tT3YjQer1G.k4xI4iS4z4rB9Y2w6S9oC4hE6xT8z3M',
 'Operator User', 'operator', 'active', NOW()),

 ('660e8400-e29b-41d4-a716-446655440003',
 '550e8400-e29b-41d4-a716-446655440000',
 'viewer@hawkscope.io','$2b$12$MN4h2Vp0EL9qQ0VgNdr8D.g1uF1fP1w1oY6V9t3P6lZ1eB3uQ5w0J',
 'Viewer User', 'viewer', 'active', NOW());

-- Insert sample servers
INSERT INTO servers (id, organization_id, hostname, ip_address, ip_internal, os_name, os_version, region, status, agent_version)
VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'prod-api-01', '203.0.113.10', '10.0.1.10', 'Ubuntu', '22.04', 'us-east-1', 'healthy', '1.0.0'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'prod-api-02', '203.0.113.11', '10.0.1.11', 'Ubuntu', '22.04', 'us-east-1', 'healthy', '1.0.0'),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'db-primary', '203.0.113.20', '10.0.3.10', 'Ubuntu', '22.04', 'us-east-1', 'healthy', '1.0.0');

-- ==================================================================================
-- GRANTS AND SECURITY
-- ==================================================================================

-- Create application user (should have limited permissions)
-- CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE ON hawkscope_db.* TO 'app_user'@'localhost';
-- CREATE USER 'app_read'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT ON hawkscope_db.* TO 'app_read'@'localhost';

-- ==================================================================================
-- NOTES
-- ==================================================================================
--
-- 1. All IDs use UUID (CHAR(36)) for multi-tenant safety and scalability
-- 2. All timestamps are UTC (TIMESTAMP uses system timezone, convert in application)
-- 3. Organizations are completely isolated - no queries should cross org boundaries
-- 4. Soft deletes (deleted_at) are used to preserve data while hiding it
-- 5. Indexes are crucial for performance - review based on actual usage patterns
-- 6. Consider partitioning metrics table by month for very high volume
-- 7. Implement data retention policies based on subscription tier
-- 8. Use prepared statements in application code to prevent SQL injection
-- 9. Enable query logging and monitoring for production systems
-- 10. Regular backups are essential - test recovery procedures
--
-- ==================================================================================


