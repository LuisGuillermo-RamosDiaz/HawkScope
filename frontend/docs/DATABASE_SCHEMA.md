# HawkScope - Database Schema Analysis

## Overview

This document describes the recommended database schema for HawkScope SOC Platform, derived from the frontend API contracts and data structures.

**Database**: PostgreSQL 15+
**Cache**: Redis 7.2+

---

## Tables

### 1. `organizations`

| Column       | Type         | Constraints          | Description                    |
|-------------|-------------|---------------------|-------------------------------|
| id          | UUID        | PK, DEFAULT uuid()  | Organization identifier       |
| name        | VARCHAR(255)| NOT NULL             | Company name                  |
| industry    | VARCHAR(100)| NOT NULL             | Industry sector               |
| size        | VARCHAR(20) | NOT NULL             | Employee count range          |
| created_at  | TIMESTAMP   | DEFAULT NOW()        | Creation timestamp            |
| updated_at  | TIMESTAMP   | DEFAULT NOW()        | Last update                   |

### 2. `users`

| Column          | Type         | Constraints                      | Description                    |
|----------------|-------------|--------------------------------|-------------------------------|
| id             | UUID        | PK, DEFAULT uuid()              | User identifier               |
| organization_id| UUID        | FK -> organizations.id, NOT NULL| Organization membership       |
| email          | VARCHAR(255)| UNIQUE, NOT NULL                | Login email                   |
| password_hash  | VARCHAR(255)| NOT NULL                        | bcrypt hashed password        |
| name           | VARCHAR(255)| NOT NULL                        | Display name                  |
| role           | ENUM        | ('admin','operator','viewer')   | RBAC role                     |
| status         | ENUM        | ('active','inactive','invited') | Account status                |
| two_factor     | BOOLEAN     | DEFAULT FALSE                   | 2FA enabled                   |
| last_access    | TIMESTAMP   | NULL                            | Last login timestamp          |
| created_at     | TIMESTAMP   | DEFAULT NOW()                   | Creation timestamp            |
| updated_at     | TIMESTAMP   | DEFAULT NOW()                   | Last update                   |

**Indexes**: `(email)` UNIQUE, `(organization_id, role)`

### 3. `sessions`

| Column       | Type         | Constraints                  | Description                    |
|-------------|-------------|----------------------------|-------------------------------|
| id          | UUID        | PK, DEFAULT uuid()          | Session identifier            |
| user_id     | UUID        | FK -> users.id, NOT NULL     | User reference                |
| token       | TEXT        | NOT NULL                     | JWT token (stored for invalidation) |
| ip_address  | INET        | NOT NULL                     | Client IP                     |
| user_agent  | TEXT        | NULL                         | Browser user agent            |
| expires_at  | TIMESTAMP   | NOT NULL                     | Token expiration              |
| created_at  | TIMESTAMP   | DEFAULT NOW()                | Session start                 |

**Indexes**: `(token)` for lookup, `(user_id, created_at)` for session listing

### 4. `servers` (nodes/resources)

| Column       | Type         | Constraints                      | Description                    |
|-------------|-------------|--------------------------------|-------------------------------|
| id          | UUID        | PK, DEFAULT uuid()              | Server identifier             |
| organization_id | UUID    | FK -> organizations.id, NOT NULL| Organization ownership        |
| hostname    | VARCHAR(255)| NOT NULL                        | Server hostname               |
| ip_address  | INET        | NOT NULL                        | Server IP                     |
| region      | VARCHAR(50) | NOT NULL                        | Datacenter region             |
| os          | VARCHAR(100)| NULL                            | Operating system              |
| status      | ENUM        | ('healthy','warning','critical','offline') | Current status   |
| cpu_usage   | DECIMAL(5,2)| DEFAULT 0                       | CPU percentage                |
| ram_usage   | DECIMAL(5,2)| DEFAULT 0                       | RAM percentage                |
| disk_usage  | DECIMAL(5,2)| DEFAULT 0                       | Disk percentage               |
| uptime      | BIGINT      | DEFAULT 0                       | Uptime in seconds             |
| agent_version | VARCHAR(20)| NULL                           | Installed agent version       |
| last_heartbeat | TIMESTAMP| NULL                            | Last agent heartbeat          |
| created_at  | TIMESTAMP   | DEFAULT NOW()                   | Registration timestamp        |

**Indexes**: `(organization_id, status)`, `(last_heartbeat)` for offline detection

### 5. `metrics`

| Column       | Type         | Constraints                      | Description                    |
|-------------|-------------|--------------------------------|-------------------------------|
| id          | BIGSERIAL   | PK                              | Auto-increment identifier     |
| server_id   | UUID        | FK -> servers.id, NOT NULL       | Server reference              |
| cpu         | DECIMAL(5,2)| NOT NULL                        | CPU usage at point in time    |
| ram         | DECIMAL(5,2)| NOT NULL                        | RAM usage                     |
| disk        | DECIMAL(5,2)| NOT NULL                        | Disk usage                    |
| network_in  | BIGINT      | DEFAULT 0                       | Network bytes in              |
| network_out | BIGINT      | DEFAULT 0                       | Network bytes out             |
| response_time | INTEGER   | DEFAULT 0                       | Response time in ms           |
| requests    | INTEGER     | DEFAULT 0                       | Requests count                |
| timestamp   | TIMESTAMP   | NOT NULL, DEFAULT NOW()          | Metric timestamp              |

**Indexes**: `(server_id, timestamp)` for time-series queries
**Partitioning**: By month on `timestamp` column (recommended for high volume)

### 6. `audit_logs`

| Column       | Type         | Constraints                      | Description                    |
|-------------|-------------|--------------------------------|-------------------------------|
| id          | BIGSERIAL   | PK                              | Auto-increment identifier     |
| organization_id | UUID    | FK -> organizations.id, NOT NULL| Organization context          |
| user_id     | UUID        | FK -> users.id, NULL             | Acting user (NULL for system)  |
| action      | VARCHAR(50) | NOT NULL                        | Action type (LOGIN, UPDATE, DELETE, etc.) |
| resource    | VARCHAR(255)| NOT NULL                        | Affected resource             |
| ip_address  | INET        | NOT NULL                        | Source IP                     |
| status      | ENUM        | ('success','warning','critical') | Event outcome                |
| details     | TEXT        | NULL                            | Additional details            |
| timestamp   | TIMESTAMP   | NOT NULL, DEFAULT NOW()          | Event timestamp               |

**Indexes**: `(organization_id, timestamp)`, `(user_id)`, `(action)`, `(status)`
**Retention**: Configurable per organization (7/30/90/365 days)

### 7. `alerts`

| Column       | Type         | Constraints                      | Description                    |
|-------------|-------------|--------------------------------|-------------------------------|
| id          | UUID        | PK, DEFAULT uuid()              | Alert identifier              |
| organization_id | UUID    | FK -> organizations.id, NOT NULL| Organization context          |
| server_id   | UUID        | FK -> servers.id, NULL           | Related server                |
| type        | ENUM        | ('critical','warning','info')    | Alert severity                |
| title       | VARCHAR(255)| NOT NULL                        | Alert title                   |
| description | TEXT        | NULL                            | Alert details                 |
| status      | ENUM        | ('active','acknowledged','resolved') | Alert status            |
| created_at  | TIMESTAMP   | DEFAULT NOW()                   | Alert creation                |
| resolved_at | TIMESTAMP   | NULL                            | Resolution timestamp          |

**Indexes**: `(organization_id, status)`, `(server_id)`

### 8. `threats`

| Column       | Type         | Constraints                      | Description                    |
|-------------|-------------|--------------------------------|-------------------------------|
| id          | UUID        | PK, DEFAULT uuid()              | Threat identifier             |
| organization_id | UUID    | FK -> organizations.id, NOT NULL| Organization context          |
| name        | VARCHAR(255)| NOT NULL                        | Threat name                   |
| type        | VARCHAR(100)| NOT NULL                        | Threat category               |
| severity    | ENUM        | ('critical','high','medium','low') | Severity level             |
| source_ip   | INET        | NULL                            | Source IP address              |
| status      | ENUM        | ('blocked','mitigated','monitoring') | Current status           |
| attempts    | INTEGER     | DEFAULT 1                       | Number of attempts            |
| detected_at | TIMESTAMP   | DEFAULT NOW()                   | Detection timestamp           |

### 9. `firewall_rules`

| Column       | Type         | Constraints                      | Description                    |
|-------------|-------------|--------------------------------|-------------------------------|
| id          | UUID        | PK, DEFAULT uuid()              | Rule identifier               |
| organization_id | UUID    | FK -> organizations.id, NOT NULL| Organization context          |
| name        | VARCHAR(255)| NOT NULL                        | Rule name                     |
| protocol    | VARCHAR(10) | NOT NULL                        | Protocol (TCP, UDP, ICMP)     |
| port        | VARCHAR(20) | NOT NULL                        | Port or port range            |
| action      | ENUM        | ('allow','deny')                | Rule action                   |
| enabled     | BOOLEAN     | DEFAULT TRUE                    | Rule enabled state            |
| hits        | BIGINT      | DEFAULT 0                       | Number of hits                |
| created_at  | TIMESTAMP   | DEFAULT NOW()                   | Creation timestamp            |

### 10. `notifications`

| Column       | Type         | Constraints                      | Description                    |
|-------------|-------------|--------------------------------|-------------------------------|
| id          | UUID        | PK, DEFAULT uuid()              | Notification identifier       |
| user_id     | UUID        | FK -> users.id, NOT NULL         | Target user                   |
| type        | ENUM        | ('critical','warning','success','info') | Notification type      |
| title       | VARCHAR(255)| NOT NULL                        | Notification title            |
| description | TEXT        | NULL                            | Notification body             |
| read        | BOOLEAN     | DEFAULT FALSE                   | Read status                   |
| created_at  | TIMESTAMP   | DEFAULT NOW()                   | Creation timestamp            |

**Indexes**: `(user_id, read, created_at)` for unread notifications

---

## API Endpoints (Frontend Contract)

### Auth
| Method | Endpoint          | Request                      | Response                                    |
|--------|------------------|------------------------------|---------------------------------------------|
| POST   | /auth/login      | `{email, password}`          | `{user: {email, role}, token}`              |
| POST   | /auth/logout     | -                            | `{message}`                                 |
| POST   | /auth/refresh    | -                            | `{token}`                                   |
| GET    | /auth/verify     | -                            | `{valid, user: {email, role}}`              |

### Metrics
| Method | Endpoint              | Response                                           |
|--------|-----------------------|---------------------------------------------------|
| GET    | /metrics/latest       | `{cpu, ram, disk, network, responseTime, ...}`    |
| GET    | /metrics/historical   | `[{timestamp, cpu, ram, ...}]`                    |
| GET    | /metrics/kpis         | `{availability, errorRate, throughput, ...}`       |
| GET    | /metrics/servers      | `[{id, hostname, status, cpu, ram, disk, ...}]`   |

---

## Redis Cache Strategy

| Key Pattern                    | TTL     | Description                    |
|-------------------------------|---------|-------------------------------|
| `metrics:latest:{serverId}`   | 10s     | Latest server metrics          |
| `metrics:kpis:{orgId}`        | 30s     | Aggregated KPIs                |
| `session:{token}`             | 1h      | Session validation cache       |
| `ratelimit:{userId}`          | 1m      | API rate limiting counter      |

---

## Role-Based Access Control (RBAC)

| Resource    | ADMIN | OPERATOR | VIEWER |
|------------|-------|----------|--------|
| Dashboard  | RW    | R        | R      |
| Resources  | RW    | R        | R      |
| KPIs       | RW    | R        | R      |
| Audit      | RW    | -        | R      |
| Security   | RW    | R        | -      |
| Settings   | RW    | -        | -      |
| Users      | RW    | -        | -      |
