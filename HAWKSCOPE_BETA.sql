-- ==================================================================================
-- HawkScope SOC Platform - VERSION BETA
-- Base de Datos: MySQL 8.0+
-- Propósito: Plataforma de monitoreo de infraestructura y detección de incidentes
-- ==================================================================================
-- Proyecto Integrador + Base de Datos
-- Requisitos cubiertos:
--   ✅ 7 tablas relacionadas (mínimo 5)
--   ✅ Normalización estricta (1FN, 2FN, 3FN)
--   ✅ PK y FK con ON DELETE CASCADE / ON UPDATE CASCADE
--   ✅ 3 Funciones
--   ✅ 2 Procedimientos Almacenados
--   ✅ 2 Triggers
--   ✅ 1 Transacción
--   ✅ 4 Roles de seguridad (DBA, Operador, Auditor, Agente)
-- ==================================================================================

DROP DATABASE IF EXISTS hawkscope_db;
CREATE DATABASE hawkscope_db;
USE hawkscope_db;

-- ==================================================================================
-- PARTE 1: DDL - ESTRUCTURA DE TABLAS
-- ==================================================================================

-- ═══════════════════════════════════════════════════════════════════
-- TABLA 1: ORGANIZACIONES (Tabla padre principal)
-- Cada organización es un "inquilino" aislado del sistema
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE organizations (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  name VARCHAR(255) NOT NULL COMMENT 'Nombre de la organización',
  industry VARCHAR(100) COMMENT 'Sector: IT, Salud, Finanzas, etc',
  api_key VARCHAR(255) UNIQUE COMMENT 'Clave maestra para agentes',
  status ENUM('active', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Organizaciones/empresas registradas';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA 2: USUARIOS
-- Empleados/miembros de cada organización con roles RBAC
-- FK → organizations (CASCADE)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL COMMENT 'Único por organización',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') DEFAULT 'viewer' COMMENT 'Rol RBAC',
  status ENUM('active', 'inactive', 'invited') DEFAULT 'invited',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT unique_org_email UNIQUE (organization_id, email),

  INDEX idx_org_id (organization_id),
  INDEX idx_email (email)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Usuarios del sistema';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA 3: SESIONES (Control de acceso - JWT)
-- FK → users (CASCADE)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(512) NOT NULL UNIQUE COMMENT 'JWT token',
  ip_address VARCHAR(45) NOT NULL COMMENT 'IPv4 o IPv6',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,

  INDEX idx_user_id (user_id),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sesiones activas y tokens JWT';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA 4: SERVIDORES (Infraestructura monitoreada)
-- FK → organizations (CASCADE)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE servers (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  hostname VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  os_name VARCHAR(100) COMMENT 'Ubuntu, Debian, Windows, etc',
  region VARCHAR(100) COMMENT 'us-east-1, eu-west-1, etc',
  status ENUM('healthy', 'warning', 'critical', 'offline') DEFAULT 'offline',
  cpu_usage DECIMAL(5,2) DEFAULT 0 COMMENT 'Porcentaje 0-100',
  ram_usage DECIMAL(5,2) DEFAULT 0 COMMENT 'Porcentaje 0-100',
  disk_usage DECIMAL(5,2) DEFAULT 0 COMMENT 'Porcentaje 0-100',
  uptime_seconds BIGINT DEFAULT 0 COMMENT 'Tiempo en línea (segundos)',
  agent_api_key VARCHAR(255) UNIQUE COMMENT 'Clave API del agente',
  last_heartbeat TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_servers_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT unique_org_hostname UNIQUE (organization_id, hostname),

  INDEX idx_org_id (organization_id),
  INDEX idx_status (status)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Servidores/nodos monitoreados';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA 5: MÉTRICAS (Serie de tiempo - corazón del monitoreo)
-- FK → servers (CASCADE), FK → organizations (CASCADE)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE metrics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  server_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NULL COMMENT 'Desnormalizado para consultas rápidas',
  cpu_usage DECIMAL(5,2) NOT NULL,
  ram_usage DECIMAL(5,2) NOT NULL,
  disk_usage DECIMAL(5,2) NOT NULL,
  network_bytes_in BIGINT DEFAULT 0 COMMENT 'Bytes recibidos',
  network_bytes_out BIGINT DEFAULT 0 COMMENT 'Bytes enviados',
  response_time_ms INT DEFAULT 0 COMMENT 'Tiempo de respuesta promedio (ms)',
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_metrics_server FOREIGN KEY (server_id)
    REFERENCES servers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_metrics_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,

  INDEX idx_server_time (server_id, timestamp DESC),
  INDEX idx_org_time (organization_id, timestamp DESC)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Métricas de rendimiento en serie de tiempo';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA 6: ALERTAS (Incidentes detectados)
-- FK → organizations (CASCADE), FK → servers (SET NULL)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE alerts (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  server_id CHAR(36) NULL COMMENT 'NULL = alerta global',
  type ENUM('critical', 'warning', 'info') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_alerts_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_alerts_server FOREIGN KEY (server_id)
    REFERENCES servers(id) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_org_id (organization_id),
  INDEX idx_status (status),
  INDEX idx_type (type)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Alertas generadas por el sistema';

-- ═══════════════════════════════════════════════════════════════════
-- TABLA 7: AUDIT_LOGS (Bitácora de auditoría - caja negra)
-- FK → organizations (CASCADE), FK → users (SET NULL)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL COMMENT 'NULL = acción del sistema',
  action VARCHAR(100) NOT NULL COMMENT 'LOGIN, CREATE, UPDATE, DELETE, etc',
  resource_type VARCHAR(100) COMMENT 'users, servers, alerts, etc',
  resource_name VARCHAR(255) COMMENT 'Nombre del recurso afectado',
  ip_address VARCHAR(45) NOT NULL,
  status ENUM('success', 'warning', 'critical', 'failure') DEFAULT 'success',
  changes JSON COMMENT 'Antes/después para trazabilidad',
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_audit_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_org_id (organization_id), 
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bitácora de auditoría del sistema';

-- ==================================================================================
-- PARTE 2: FUNCIONES (3 funciones)
-- ==================================================================================

DELIMITER //

-- ───────────────────────────────────────────────────────────────────
-- FUNCIÓN 1: Calcular el estado de salud de un servidor
-- Recibe los % de CPU y RAM, retorna el status automáticamente
-- ───────────────────────────────────────────────────────────────────
CREATE FUNCTION fn_calculate_server_status(
  p_cpu DECIMAL(5,2),
  p_ram DECIMAL(5,2)
)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
  IF p_cpu >= 90 OR p_ram >= 90 THEN
    RETURN 'critical';
  ELSEIF p_cpu >= 75 OR p_ram >= 75 THEN
    RETURN 'warning';
  ELSE
    RETURN 'healthy';
  END IF;
END //

-- ───────────────────────────────────────────────────────────────────
-- FUNCIÓN 2: Contar alertas activas de una organización
-- Retorna el total de alertas sin resolver
-- ───────────────────────────────────────────────────────────────────
CREATE FUNCTION fn_active_alert_count(
  p_org_id CHAR(36)
)
RETURNS INT
READS SQL DATA
BEGIN
  DECLARE total INT;
  SELECT COUNT(*) INTO total
  FROM alerts
  WHERE organization_id = p_org_id AND status = 'active';
  RETURN total;
END //

-- ───────────────────────────────────────────────────────────────────
-- FUNCIÓN 3: Validar formato de email
-- Retorna TRUE si el email tiene formato válido
-- ───────────────────────────────────────────────────────────────────
CREATE FUNCTION fn_validate_email(
  p_email VARCHAR(255)
)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
  -- Verifica que contenga @ y al menos un punto después del @
  IF p_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END //

-- ==================================================================================
-- PARTE 3: PROCEDIMIENTOS ALMACENADOS (2 procedimientos)
-- ==================================================================================

-- ───────────────────────────────────────────────────────────────────
-- SP 1: Registrar métricas y actualizar estado del servidor
-- Proceso de inserción compleja: inserta métrica + actualiza server
-- + genera alerta automática si hay valores críticos
-- ───────────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_register_metrics(
  IN p_server_id CHAR(36),
  IN p_org_id CHAR(36),
  IN p_cpu DECIMAL(5,2),
  IN p_ram DECIMAL(5,2),
  IN p_disk DECIMAL(5,2),
  IN p_net_in BIGINT,
  IN p_net_out BIGINT,
  IN p_resp_time INT
)
BEGIN
  DECLARE v_new_status VARCHAR(20);
  DECLARE v_alert_id CHAR(36);

  -- 1. Insertar la métrica en la serie de tiempo
  INSERT INTO metrics (server_id, organization_id, cpu_usage, ram_usage, disk_usage,
                       network_bytes_in, network_bytes_out, response_time_ms)
  VALUES (p_server_id, p_org_id, p_cpu, p_ram, p_disk, p_net_in, p_net_out, p_resp_time);

  -- 2. Calcular nuevo estado usando nuestra función
  SET v_new_status = fn_calculate_server_status(p_cpu, p_ram);

  -- 3. Actualizar el servidor con las métricas actuales
  UPDATE servers
  SET cpu_usage = p_cpu,
      ram_usage = p_ram,
      disk_usage = p_disk,
      status = v_new_status,
      last_heartbeat = NOW()
  WHERE id = p_server_id;

  -- 4. Si el estado es crítico, generar alerta automática
  IF v_new_status = 'critical' THEN
    SET v_alert_id = UUID();
    INSERT INTO alerts (id, organization_id, server_id, type, title, description)
    VALUES (
      v_alert_id,
      p_org_id,
      p_server_id,
      'critical',
      CONCAT('Recursos críticos en servidor'),
      CONCAT('CPU: ', p_cpu, '% | RAM: ', p_ram, '% - Se requiere atención inmediata')
    );
  END IF;
END //

-- ───────────────────────────────────────────────────────────────────
-- SP 2: Generar reporte parametrizado del estado de infraestructura
-- Recibe una org_id y retorna un resumen completo
-- ───────────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_infrastructure_report(
  IN p_org_id CHAR(36)
)
BEGIN
  -- Reporte 1: Resumen de servidores por estado
  SELECT
    COUNT(*) AS total_servers,
    SUM(CASE WHEN status = 'healthy' THEN 1 ELSE 0 END) AS healthy,
    SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) AS warning,
    SUM(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) AS critical,
    SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) AS offline,
    ROUND(AVG(cpu_usage), 2) AS avg_cpu,
    ROUND(AVG(ram_usage), 2) AS avg_ram,
    ROUND(AVG(disk_usage), 2) AS avg_disk
  FROM servers
  WHERE organization_id = p_org_id;

  -- Reporte 2: Alertas activas por tipo
  SELECT
    type,
    COUNT(*) AS total,
    MIN(created_at) AS oldest_alert,
    MAX(created_at) AS newest_alert
  FROM alerts
  WHERE organization_id = p_org_id AND status = 'active'
  GROUP BY type
  ORDER BY FIELD(type, 'critical', 'warning', 'info');

  -- Reporte 3: Actividad de auditoría últimas 24 horas
  SELECT
    action,
    COUNT(*) AS occurrences,
    SUM(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) AS critical_events
  FROM audit_logs
  WHERE organization_id = p_org_id
    AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  GROUP BY action
  ORDER BY occurrences DESC;
END //

-- ==================================================================================
-- PARTE 4: TRIGGERS (2 triggers)
-- ==================================================================================

-- ───────────────────────────────────────────────────────────────────
-- TRIGGER 1: Auditoría automática al modificar un servidor
-- Registra en audit_logs cada vez que se actualiza un servidor
-- ───────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_audit_server_update
AFTER UPDATE ON servers
FOR EACH ROW
BEGIN
  -- Solo registrar si cambió el estado o las métricas significativamente
  IF OLD.status != NEW.status
     OR ABS(OLD.cpu_usage - NEW.cpu_usage) > 5
     OR ABS(OLD.ram_usage - NEW.ram_usage) > 5 THEN

    INSERT INTO audit_logs (organization_id, user_id, action, resource_type,
                            resource_name, ip_address, status, changes)
    VALUES (
      NEW.organization_id,
      NULL, -- acción del sistema
      'UPDATE',
      'servers',
      NEW.hostname,
      '127.0.0.1',
      CASE
        WHEN NEW.status = 'critical' THEN 'critical'
        WHEN NEW.status = 'warning' THEN 'warning'
        ELSE 'success'
      END,
      JSON_OBJECT(
        'status_before', OLD.status,
        'status_after', NEW.status,
        'cpu_before', OLD.cpu_usage,
        'cpu_after', NEW.cpu_usage,
        'ram_before', OLD.ram_usage,
        'ram_after', NEW.ram_usage
      )
    );
  END IF;
END //

-- ───────────────────────────────────────────────────────────────────
-- TRIGGER 2: Validación de seguridad al insertar un usuario
-- Verifica que el email sea válido y registra el evento en auditoría
-- ───────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_validate_user_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  -- Validar formato de email usando nuestra función
  IF fn_validate_email(NEW.email) = FALSE THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'ERROR: El formato del email no es válido';
  END IF;

  -- Asegurar que el password_hash no esté vacío
  IF NEW.password_hash IS NULL OR LENGTH(NEW.password_hash) < 10 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'ERROR: El hash de contraseña es inválido o muy corto';
  END IF;
END //

DELIMITER ;

-- Trigger de auditoría para INSERT en users (AFTER, para que el user ya exista)
DELIMITER //
CREATE TRIGGER trg_audit_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (organization_id, user_id, action, resource_type,
                          resource_name, ip_address, status)
  VALUES (
    NEW.organization_id,
    NEW.id,
    'CREATE',
    'users',
    NEW.full_name,
    '127.0.0.1',
    'success'
  );
END //
DELIMITER ;

-- ==================================================================================
-- PARTE 5: TRANSACCIÓN
-- Proceso sensible: Dar de baja una organización completa
-- Resuelve todas sus alertas, cierra sesiones y desactiva usuarios
-- ==================================================================================

DELIMITER //
CREATE PROCEDURE sp_suspend_organization(
  IN p_org_id CHAR(36),
  IN p_reason TEXT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    -- Si algo falla, revertir TODOS los cambios
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'ERROR: La suspensión falló, se revirtieron todos los cambios';
  END;

  START TRANSACTION;

    -- 1. Resolver todas las alertas activas
    UPDATE alerts
    SET status = 'resolved', resolved_at = NOW()
    WHERE organization_id = p_org_id AND status IN ('active', 'acknowledged');

    -- 2. Eliminar todas las sesiones activas (cerrar sesión forzada)
    DELETE FROM sessions
    WHERE user_id IN (SELECT id FROM users WHERE organization_id = p_org_id);

    -- 3. Desactivar todos los usuarios
    UPDATE users
    SET status = 'inactive'
    WHERE organization_id = p_org_id;

    -- 4. Poner todos los servidores offline
    UPDATE servers
    SET status = 'offline'
    WHERE organization_id = p_org_id;

    -- 5. Cambiar estado de la organización
    UPDATE organizations
    SET status = 'suspended'
    WHERE id = p_org_id;

    -- 6. Registrar en auditoría
    INSERT INTO audit_logs (organization_id, user_id, action, resource_type,
                            resource_name, ip_address, status, changes)
    VALUES (
      p_org_id,
      NULL,
      'SUSPEND',
      'organizations',
      (SELECT name FROM organizations WHERE id = p_org_id),
      '127.0.0.1',
      'critical',
      JSON_OBJECT('reason', p_reason, 'suspended_at', NOW())
    );

  -- Si todo salió bien, confirmar los cambios
  COMMIT;
END //
DELIMITER ;

-- ==================================================================================
-- PARTE 6: SEGURIDAD Y ROLES DE USUARIO (4 roles)
-- ==================================================================================

-- ROL 1: Administrador (DBA) - Acceso total
CREATE USER IF NOT EXISTS 'hawkscope_dba'@'%' IDENTIFIED BY 'Dba$ecur3_2024!';
GRANT ALL PRIVILEGES ON hawkscope_db.* TO 'hawkscope_dba'@'%' WITH GRANT OPTION;

-- ROL 2: Operador - Lectura y escritura en tablas, SIN acceso DDL
CREATE USER IF NOT EXISTS 'hawkscope_operator'@'%' IDENTIFIED BY 'Op3r@tor_2024!';
GRANT SELECT, INSERT, UPDATE, DELETE ON hawkscope_db.organizations TO 'hawkscope_operator'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON hawkscope_db.users TO 'hawkscope_operator'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON hawkscope_db.sessions TO 'hawkscope_operator'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON hawkscope_db.servers TO 'hawkscope_operator'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON hawkscope_db.metrics TO 'hawkscope_operator'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON hawkscope_db.alerts TO 'hawkscope_operator'@'%';
GRANT SELECT ON hawkscope_db.audit_logs TO 'hawkscope_operator'@'%';
-- Operador puede ejecutar los SPs pero NO modificar estructura
GRANT EXECUTE ON PROCEDURE hawkscope_db.sp_register_metrics TO 'hawkscope_operator'@'%';
GRANT EXECUTE ON PROCEDURE hawkscope_db.sp_infrastructure_report TO 'hawkscope_operator'@'%';

-- ROL 3: Auditor - SOLO puede ejecutar SPs, sin acceso directo a tablas
CREATE USER IF NOT EXISTS 'hawkscope_auditor'@'%' IDENTIFIED BY 'Aud1t0r_2024!';
GRANT EXECUTE ON PROCEDURE hawkscope_db.sp_infrastructure_report TO 'hawkscope_auditor'@'%';
GRANT EXECUTE ON PROCEDURE hawkscope_db.sp_suspend_organization TO 'hawkscope_auditor'@'%';
-- El auditor puede leer SOLO la bitácora de auditoría
GRANT SELECT ON hawkscope_db.audit_logs TO 'hawkscope_auditor'@'%';

-- ROL 4 (Sugerencia propia): Agente de Monitoreo
-- Solo puede INSERTAR métricas y ACTUALIZAR el heartbeat de servidores
-- Simula el agente instalado en cada servidor que envía datos
CREATE USER IF NOT EXISTS 'hawkscope_agent'@'%' IDENTIFIED BY 'Ag3nt_M0n1t0r!';
GRANT INSERT ON hawkscope_db.metrics TO 'hawkscope_agent'@'%';
GRANT SELECT, UPDATE (cpu_usage, ram_usage, disk_usage, status, last_heartbeat)
  ON hawkscope_db.servers TO 'hawkscope_agent'@'%';
GRANT EXECUTE ON PROCEDURE hawkscope_db.sp_register_metrics TO 'hawkscope_agent'@'%';

FLUSH PRIVILEGES;

-- ==================================================================================
-- PARTE 7: DML - DATOS DE DEMOSTRACIÓN
-- ==================================================================================

-- Organización demo
INSERT INTO organizations (id, name, industry, api_key, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'HawkScope Demo Corp', 'Tecnología', 'sk_demo_hawkscope_2024', 'active');

-- Usuarios (password_hash simulado con bcrypt format)
INSERT INTO users (id, organization_id, email, password_hash, full_name, role, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000',
 'admin@hawkscope.io', '$2b$12$LJ3m5Rs1GK0sR1KhMer0F.h3vH3hR3x3qA8X1v5R8nB3gD5wS7y2K',
 'Admin Principal', 'admin', 'active'),

('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000',
 'operador@hawkscope.io', '$2b$12$PQ7k5Ws3HN2tT3YjQer1G.k4xI4iS4z4rB9Y2w6S9oC4hE6xT8z3M',
 'Carlos Operador', 'operator', 'active'),

('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000',
 'viewer@hawkscope.io', '$2b$12$MN4h2Vp0EL9qQ0VgNdr8D.g1uF1fP1w1oY6V9t3P6lZ1eB3uQ5w0J',
 'Ana Viewer', 'viewer', 'active');

-- Servidores
INSERT INTO servers (id, organization_id, hostname, ip_address, os_name, region, status, cpu_usage, ram_usage, disk_usage, uptime_seconds) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000',
 'prod-api-01', '10.0.1.10', 'Ubuntu 22.04', 'US-East', 'healthy', 42.00, 65.00, 45.00, 3932400),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000',
 'prod-api-02', '10.0.1.11', 'Ubuntu 22.04', 'US-East', 'healthy', 38.00, 58.00, 52.00, 3932400),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000',
 'worker-03', '10.0.2.20', 'Debian 12', 'US-West', 'warning', 87.00, 72.00, 60.00, 1051200),

('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000',
 'db-primary', '10.0.3.10', 'Ubuntu 22.04', 'US-East', 'healthy', 55.00, 80.00, 70.00, 7776000),

('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000',
 'cache-redis', '10.0.4.10', 'Alpine 3.18', 'US-East', 'healthy', 12.00, 35.00, 15.00, 5184000);

-- Métricas históricas (simular las últimas horas)
INSERT INTO metrics (server_id, organization_id, cpu_usage, ram_usage, disk_usage, network_bytes_in, network_bytes_out, response_time_ms, timestamp) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 35.20, 60.10, 44.50, 1048576, 524288, 95, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 42.80, 63.40, 44.80, 2097152, 1048576, 110, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 41.50, 65.00, 45.00, 1572864, 786432, 105, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 78.30, 68.20, 58.00, 524288, 262144, 250, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 85.10, 70.50, 59.20, 786432, 393216, 340, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 87.40, 72.00, 60.00, 655360, 327680, 380, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 50.00, 78.00, 69.00, 3145728, 1572864, 45, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 55.00, 80.00, 70.00, 4194304, 2097152, 50, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Alertas
INSERT INTO alerts (id, organization_id, server_id, type, title, description, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000',
 '770e8400-e29b-41d4-a716-446655440003', 'warning',
 'CPU alta en worker-03', 'CPU al 87% durante los últimos 30 minutos', 'active'),

('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000',
 '770e8400-e29b-41d4-a716-446655440004', 'info',
 'Disco al 70% en db-primary', 'Se recomienda planificar expansión de almacenamiento', 'active'),

('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000',
 '770e8400-e29b-41d4-a716-446655440001', 'critical',
 'Timeout en health-check', 'El servidor no respondió al health-check por 60 segundos', 'resolved');

-- Logs de auditoría
INSERT INTO audit_logs (organization_id, user_id, action, resource_type, resource_name, ip_address, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001',
 'LOGIN', 'auth', 'Auth System', '192.168.1.100', 'success'),

('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002',
 'UPDATE', 'servers', 'worker-03', '192.168.1.105', 'success'),

('550e8400-e29b-41d4-a716-446655440000', NULL,
 'HEALTH', 'servers', 'All Servers', '10.0.0.1', 'success'),

('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001',
 'CREATE', 'users', 'Carlos Operador', '192.168.1.100', 'success');

-- ==================================================================================
-- PARTE 8: CONSULTAS DE VERIFICACIÓN
-- Ejecutar al final para demostrar que todo funciona
-- ==================================================================================

-- ═══ VERIFICACIÓN 1: Ver estructura de tablas ═══
SELECT '=== TABLAS CREADAS ===' AS info;
SHOW TABLES;

-- ═══ VERIFICACIÓN 2: Probar la FUNCIÓN fn_calculate_server_status ═══
SELECT '=== PRUEBA FUNCIÓN: fn_calculate_server_status ===' AS info;
SELECT
  fn_calculate_server_status(45.0, 60.0) AS 'CPU=45 RAM=60 → healthy',
  fn_calculate_server_status(80.0, 60.0) AS 'CPU=80 RAM=60 → warning',
  fn_calculate_server_status(95.0, 60.0) AS 'CPU=95 RAM=60 → critical';

-- ═══ VERIFICACIÓN 3: Probar la FUNCIÓN fn_active_alert_count ═══
SELECT '=== PRUEBA FUNCIÓN: fn_active_alert_count ===' AS info;
SELECT fn_active_alert_count('550e8400-e29b-41d4-a716-446655440000') AS alertas_activas;

-- ═══ VERIFICACIÓN 4: Probar la FUNCIÓN fn_validate_email ═══
SELECT '=== PRUEBA FUNCIÓN: fn_validate_email ===' AS info;
SELECT
  fn_validate_email('admin@hawkscope.io') AS 'email_valido',
  fn_validate_email('esto-no-es-email') AS 'email_invalido';

-- ═══ VERIFICACIÓN 5: Probar SP sp_register_metrics (generará alerta automática) ═══
SELECT '=== PRUEBA SP: sp_register_metrics (CPU=95%, dispara alerta) ===' AS info;
CALL sp_register_metrics(
  '770e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  95.50, 92.00, 46.00, 5242880, 2621440, 450
);
-- Verificar que se generó la alerta y se actualizó el servidor
SELECT id, hostname, status, cpu_usage, ram_usage FROM servers WHERE id = '770e8400-e29b-41d4-a716-446655440001';
SELECT id, type, title, status FROM alerts WHERE server_id = '770e8400-e29b-41d4-a716-446655440001' ORDER BY created_at DESC LIMIT 2;

-- ═══ VERIFICACIÓN 6: Probar SP sp_infrastructure_report ═══
SELECT '=== PRUEBA SP: sp_infrastructure_report ===' AS info;
CALL sp_infrastructure_report('550e8400-e29b-41d4-a716-446655440000');

-- ═══ VERIFICACIÓN 7: Verificar que el TRIGGER de auditoría registró cambios ═══
SELECT '=== PRUEBA TRIGGER: Registros automáticos en audit_logs ===' AS info;
SELECT action, resource_type, resource_name, status, timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 10;

-- ═══ VERIFICACIÓN 8: Probar la TRANSACCIÓN sp_suspend_organization ═══
-- Primero crear una org temporal para suspenderla
INSERT INTO organizations (id, name, industry, status) VALUES
('999e8400-e29b-41d4-a716-446655440099', 'Empresa Test Suspender', 'Pruebas', 'active');

INSERT INTO users (id, organization_id, email, password_hash, full_name, role, status) VALUES
('669e8400-e29b-41d4-a716-446655440099', '999e8400-e29b-41d4-a716-446655440099',
 'test@test.com', '$2b$12$TestHashLargoSuficienteParaPassTest123456789',
 'Usuario Test', 'admin', 'active');

SELECT '=== ANTES DE SUSPENDER ===' AS info;
SELECT id, name, status FROM organizations WHERE id = '999e8400-e29b-41d4-a716-446655440099';
SELECT id, full_name, status FROM users WHERE organization_id = '999e8400-e29b-41d4-a716-446655440099';

SELECT '=== EJECUTANDO TRANSACCIÓN: sp_suspend_organization ===' AS info;
CALL sp_suspend_organization('999e8400-e29b-41d4-a716-446655440099', 'Prueba de suspensión para demo');

SELECT '=== DESPUÉS DE SUSPENDER ===' AS info;
SELECT id, name, status FROM organizations WHERE id = '999e8400-e29b-41d4-a716-446655440099';
SELECT id, full_name, status FROM users WHERE organization_id = '999e8400-e29b-41d4-a716-446655440099';

-- Ver el registro de auditoría de la suspensión
SELECT action, resource_type, resource_name, status, changes
FROM audit_logs
WHERE action = 'SUSPEND'
ORDER BY timestamp DESC
LIMIT 1;

SELECT '=== ✅ TODAS LAS VERIFICACIONES COMPLETADAS ===' AS info;
