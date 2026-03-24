-- ==================================================================================
-- HawkScope SOC Platform
-- PARCHE PARA BASE DE DATOS AIVEN
-- Este script actualizará tu base de datos en Aiven sin borrar tus datos actuales,
-- alineando la estructura con lo que espera el Backend en Java.
-- ==================================================================================

USE hawkscope_db;

-- 1. Arreglar tabla USERS
-- Tu base de datos tiene "name" pero el backend inserta "full_name"
-- Primero agregamos la nueva columna
ALTER TABLE users ADD COLUMN full_name VARCHAR(255) AFTER password_hash;

-- Copiamos los datos existentes si hay alguno
UPDATE users SET full_name = name;

-- Hacemos que full_name sea obligatorio como en el backend
ALTER TABLE users MODIFY COLUMN full_name VARCHAR(255) NOT NULL;

-- Eliminamos la columna vieja "name" porque el backend no la usará
ALTER TABLE users DROP COLUMN name;


-- 2. Arreglar tabla METRICS
-- El backend no manda organization_id en las métricas, solo manda server_id.
-- Si organization_id es NOT NULL, va a fallar cuando intenten subir métricas. 
-- Hacemos que organization_id permita valores NULL.
ALTER TABLE metrics MODIFY COLUMN organization_id CHAR(36) NULL COMMENT 'Desnormalizado para consultas rápidas';

-- ==================================================================================
-- ¡HECHO! Tu base de datos ya es compatible con el Backend y el Frontend en Render.
-- Ahora el registro ("Crear Cuenta") funcionará perfectamente.
-- ==================================================================================
