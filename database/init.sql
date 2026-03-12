CREATE DATABASE IF NOT EXISTS dashboard_db;
USE dashboard_db;

-- 1. Organizaciones (Para las PyMEs)
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_organizations PRIMARY KEY (id)
);

-- 2. Usuarios (Ligados a una organización)
CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    organization_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM("ADMIN","OPERATOR","VIEWER") NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_app_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email_org UNIQUE (organization_id, email),
    CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- 3. Agentes (Servidores monitoreados)
CREATE TABLE IF NOT EXISTS agents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    organization_id BIGINT NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    api_key_hash VARCHAR(64) NOT NULL UNIQUE,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen TIMESTAMP NULL,
    registered_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_agents PRIMARY KEY (id),
    CONSTRAINT fk_agents_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_agents_user FOREIGN KEY (registered_by) REFERENCES app_users(id)
);

-- 4. Métricas (Lo que envía el Agente)
CREATE TABLE IF NOT EXISTS metrics (
    id BIGINT NOT NULL AUTO_INCREMENT,
    agent_id BIGINT NOT NULL,
    cpu_usage DECIMAL(5,2) NOT NULL,
    ram_usage DECIMAL(5,2) NOT NULL,
    health_status VARCHAR(10) NOT NULL DEFAULT "OK",
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_metrics PRIMARY KEY (id),
    CONSTRAINT fk_metrics_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- 5. Auditoría Pro (Usa JSON para guardar los cambios)
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT NOT NULL,
    action_type ENUM("INSERT", "UPDATE", "DELETE") NOT NULL,
    old_data JSON NULL,
    new_data JSON NULL,
    db_user VARCHAR(100) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_audit PRIMARY KEY (id)
);

-- ==========================================================
-- SECCIÓN DE SEGURIDAD (USUARIOS DE BASE DE DATOS)
-- ==========================================================
-- Nota: Usamos '%' en lugar de 'localhost' para que Docker permita la conexión
CREATE USER IF NOT EXISTS 'hawkscope_backend'@'%' IDENTIFIED BY 'pL4@nQ7$';
CREATE USER IF NOT EXISTS 'hawkscope_agent'@'%' IDENTIFIED BY 'wZ6!vB3#';

GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_db.* TO 'hawkscope_backend'@'%';
GRANT INSERT ON dashboard_db.metrics TO 'hawkscope_agent'@'%';
GRANT UPDATE ON dashboard_db.agents TO 'hawkscope_agent'@'%';

FLUSH PRIVILEGES;

-- ==========================================================
-- DATOS DE PRUEBA (Para que no esté vacía)
-- ==========================================================
INSERT INTO organizations (company_name, slug, email) VALUES ('PyME Principal', 'pyme-1', 'contacto@pyme1.com');
INSERT INTO app_users (organization_id, email, password_hash, full_name, role) 
VALUES (1, 'admin@hawkscope.com', 'hash_secreto', 'Administrador General', 'ADMIN');