# 🔍 ANÁLISIS EXHAUSTIVO DEL PROYECTO - HAWKSCOPE SOC PLATFORM v2.0

**Última actualización:** Marzo 12, 2026
**Analista:** Claude Code
**Proyecto:** HawkScope - Plataforma de Monitoreo de Infraestructura y Detección de Amenazas de Ciberseguridad

---

## 📋 ÍNDICE

1. [Descripción General](#descripción-general)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura de Directorios](#estructura-de-directorios)
5. [Flujo de Datos](#flujo-de-datos)
6. [Frontend - React](#frontend---react)
7. [Base de Datos SQL Propuesta](#base-de-datos-sql-propuesta)
8. [API - Endpoints Esperados](#api---endpoints-esperados)
9. [Autenticación y RBAC](#autenticación-y-rbac)
10. [Internacionalización (i18n)](#internacionalización-i18n)

---

## Descripción General

### 🎯 Propósito
HawkScope es una **plataforma web empresarial multiempresa (multi-tenant)** para:
- **Monitoreo en tiempo real** de infraestructura (servidores, recursos)
- **Detección automática de amenazas** de ciberseguridad
- **Análisis de telemetría** recolectada por agentes distribuidos
- **Gestión centralizada** de alertas y eventos de seguridad
- **Control de acceso basado en roles** (RBAC)
- **Auditoría completa** de todas las operaciones

### 🏢 Modelo de Negocio
- **Multi-empresa/Multi-tenant:** Cada organización puede tener múltiples usuarios con diferentes roles
- **Roles de usuario:** Admin, Operator, Viewer
- **Permissionamiento granular:** Acceso diferenciado a funcionalidades según rol

### 📊 Características Principales
1. **Dashboard en tiempo real** con KPIs y métricas
2. **Monitoreo de recursos** (CPU, RAM, Disk, Network)
3. **Centro de seguridad** con detección de amenazas
4. **Gestión de vulnerabilidades** y CVEs
5. **Reglas de firewall** y bloqueos
6. **Auditoría completa** con registros de todas las acciones
7. **Gestión de usuarios** y organización
8. **Notificaciones y alertas**
9. **Setup asistido** de agentes

---

## Arquitectura del Proyecto

### Monorepo Structure
```
proyecto-dashboard/
├── agente/           # Agente Python - Recolector de telemetría
├── backend/          # API REST (aún en desarrollo)
├── frontend/         # React SPA - Interfaz de usuario
├── database/         # Scripts SQL de inicialización
├── docker-compose.yml # Orquestación local
└── README.md
```

### Componentes del Sistema

#### 1. **AGENTE (Recolector de Telemetría)**
- **Lenguaje:** Python 3
- **Responsabilidad:** Recopilar métricas de sistema e incidentes de seguridad
- **Datos recopilados:**
  - Hostname del servidor
  - IP interna y externa
  - Uso de CPU
  - Uso de RAM
  - Conexiones de red activas
  - Usuarios conectados
  - Eventos de seguridad
- **Comunicación:** HTTP POST a `/metrics` con `Authorization: Bearer API_KEY`
- **Frecuencia:** Envía datos cada 30-60 segundos por defecto
- **Instalación:** Script interactivo `install.sh` que configura systemd

**Payload de datos:**
```json
{
  "version": "1.0.0",
  "host": "prod-api-01",
  "ip": "10.0.1.10",
  "timestamp": "2024-03-11T14:32:05.123456",
  "security": {
    "active_connections": [
      {"remote": "203.0.113.45:22", "pid": 1234},
      {"remote": "198.51.100.100:443", "pid": 5678}
    ],
    "logged_users": ["root", "appuser"]
  },
  "resources": {
    "cpu": 42.5,
    "ram": 65.3
  }
}
```

#### 2. **BACKEND API** (Pendiente de implementación)
- **Lenguaje:** (No especificado, pero basado en estructura probablemente Node.js/Express o similar)
- **Responsabilidad:**
  - Recibir datos del agente
  - Validar y procesar telemetría
  - Servir datos al frontend
  - Gestionar autenticación
  - Almacenar datos en BD
- **Base de datos:** MySQL 8.0

#### 3. **FRONTEND (SPA React)**
- **Lenguaje:** JavaScript/JSX (React 18.2.0)
- **Build Tool:** Vite 5.2.0
- **Styling:** Tailwind CSS 3.3.0
- **Animaciones:** Framer Motion 10.16.0
- **Gráficas:** Recharts 2.8.0
- **Estado:** Zustand 4.4.0
- **Rutas:** React Router DOM 6.8.1
- **HTTP Client:** Axios 1.6.0
- **i18n:** i18next + react-i18next

#### 4. **BASE DE DATOS**
- **Sistema:** MySQL 8.0
- **Nombre BD:** `monitor_db` (actual) / `dashboard_db` (en docker-compose)
- **Usuario:** db_admin
- **Puerto:** 3308 (local)

---

## Stack Tecnológico

### Frontend Stack
```json
{
  "React": "18.2.0",
  "React DOM": "18.2.0",
  "React Router": "6.8.1",
  "Vite": "5.2.0",
  "Tailwind CSS": "3.3.0",
  "PostCSS": "8.4.24",
  "Autoprefixer": "10.4.14",
  "Framer Motion": "10.16.0",
  "Recharts": "2.8.0",
  "Axios": "1.6.0",
  "Zustand": "4.4.0",
  "i18next": "25.8.18",
  "react-i18next": "16.5.8",
  "lucide-react": "0.294.0"
}
```

### Development Stack
```json
{
  "ESLint": "8.57.0",
  "ESLint Plugins": ["react", "react-hooks", "react-refresh"],
  "TypeScript Support": "@types/react@18.2.66, @types/react-dom@18.2.22"
}
```

### Infraestructura
```yaml
Docker:
  - MySQL 8.0
  - phpMyAdmin (para gestión visual)

Python (Agente):
  - psutil
  - requests
  - python-dotenv
```

---

## Estructura de Directorios

```
frontend/
├── src/
│   ├── components/              # Componentes React reutilizables
│   │   ├── Layout.jsx           # Layout principal con sidebar
│   │   ├── ProtectedRoute.jsx   # HOC para rutas protegidas
│   │   ├── GlassCard.jsx        # Card base con efecto glass
│   │   ├── KpiCard.jsx          # Card para KPIs
│   │   ├── MetricsChart.jsx     # Gráfica de métricas
│   │   ├── DataTable.jsx        # Tabla genérica
│   │   ├── StatusBadge.jsx      # Badge de estado
│   │   ├── Toast.jsx            # Notificaciones
│   │   ├── Skeleton.jsx         # Loaders
│   │   ├── PageLoader.jsx       # Loader de página
│   │   ├── icons/Icon.jsx       # Wrapper de iconos Lucide
│   │   └── animations/StaggerContainer.jsx
│   │
│   ├── pages/                   # Páginas de la aplicación
│   │   ├── LandingPage.jsx      # Página de inicio (público)
│   │   ├── LoginPage.jsx        # Login (público)
│   │   ├── RegisterPage.jsx     # Registro (público)
│   │   ├── DashboardPage.jsx    # Dashboard principal
│   │   ├── ResourcesPage.jsx    # Gestión de servidores/infraestructura
│   │   ├── KPIsPage.jsx         # Métricas de KPIs
│   │   ├── SecurityPage.jsx     # Centro de seguridad
│   │   ├── AuditPage.jsx        # Registro de auditoría
│   │   ├── SettingsPage.jsx     # Configuración de la organización
│   │   ├── UsersPage.jsx        # Gestión de usuarios
│   │   └── AgentSetupPage.jsx   # Setup guiado del agente
│   │
│   ├── services/                # Servicios de API
│   │   ├── authService.js       # Login, logout, token refresh
│   │   └── metricsService.js    # Obtener métricas, KPIs, servidores
│   │
│   ├── store/                   # Store Zustand (Estado global)
│   │   ├── authStore.js         # Estado de autenticación
│   │   ├── notificationStore.js # Notificaciones
│   │   └── settingsStore.js     # Configuración del usuario
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useToast.js          # Hook para mostrar notificaciones
│   │
│   ├── utils/                   # Utilidades
│   │   ├── api.js               # Configuración de Axios con interceptores
│   │   └── exportUtils.js       # Export a CSV
│   │
│   ├── lib/                     # Librerías
│   │   └── i18n.js              # Configuración de i18next
│   │
│   ├── locales/                 # Archivos de traducción
│   │   ├── es.json              # Español
│   │   └── en.json              # Inglés
│   │
│   ├── App.jsx                  # Componente raíz
│   ├── main.jsx                 # Entry point
│   └── index.css                # Estilos globales
│
├── index.html                   # HTML plantilla
├── vite.config.js               # Configuración Vite
├── tailwind.config.js           # Configuración Tailwind
├── postcss.config.js            # Configuración PostCSS
├── package.json
└── package-lock.json

docs/
└── DATABASE_SCHEMA.md           # Documentación de esquema BD (PostgreSQL)
```

---

## Flujo de Datos

### 1. **Flujo de Autenticación**

```
Usuario → LoginPage
    ↓
authService.login(email, password)
    ↓
POST /auth/login {email, password}
    ↓
Backend valida credenciales
    ↓
Retorna {token, user: {email, role}}
    ↓
useAuthStore.login(userData)
    ↓
Almacena en localStorage (auth-storage)
    ↓
Redirige a /dashboard
```

### 2. **Flujo de Recopilación de Telemetría**

```
Agente Python (en servidores monitoreados)
    ↓ (cada 30-60s)
Recopila: CPU, RAM, conexiones, usuarios
    ↓
Construye payload JSON
    ↓
POST /metrics + Authorization: Bearer API_KEY
    ↓
Backend procesa y almacena
    ↓
Frontend solicita datos periódicamente
    ↓
metricsService.getLatest() / getHistorical()
    ↓
GET /metrics/latest | /metrics/historical?range=1h
    ↓
Datos se renderizan en gráficas
```

### 3. **Flujo de Rutas Protegidas**

```
Usuario sin autenticar → Intenta acceder a /dashboard
    ↓
ProtectedRoute verifica isAuthenticated
    ↓
Si falso → Redirige a /login
    ↓
Si verdadero → Verifica rol vs allowedRoles
    ↓
Si rol permitido → Muestra página
    ↓
Si rol no permitido → Redirige a /dashboard
```

---

## Frontend - React

### 📄 Páginas Públicas (Sin autenticación)

#### 1. **LandingPage** (`/`)
- Página de inicio/marketing
- Descripción del producto
- Call-to-action para login/registro

#### 2. **LoginPage** (`/login`)
- Formulario de login
- Email + Contraseña
- Persistencia de token en localStorage
- Redirige a `/dashboard` al éxito

#### 3. **RegisterPage** (`/register`)
- Registro de nuevos usuarios
- Creación de cuenta y organización

---

### 🔒 Páginas Protegidas (Requieren autenticación)

#### 1. **DashboardPage** (`/dashboard`)
- **Acceso:** Todos los roles (admin, operator, viewer)
- **Componentes:**
  - KPI Cards: Servidores activos, alertas críticas, uptime, tiempo respuesta
  - Gráfica de rendimiento del sistema (CPU/RAM últimas horas)
  - Feed de actividad reciente
  - Distribución de nodos
  - Nivel de amenaza
- **Datos:**
  ```javascript
  {
    totalServers: 24,
    healthyServers: 22,
    criticalServers: 2,
    uptime: 99.9,
    alerts: 5,
    responseTime: 120,
    metrics: [{cpu, ram, timestamp}],
    serverStatus: {healthy, warning, critical, total},
    recentEvents: [{type, message, time, icon}]
  }
  ```
- **Auto-refresh:** Cada 10 segundos (silent)
- **Rango de tiempo:** 1h, 6h, 24h

#### 2. **ResourcesPage** (`/resources`)
- **Acceso:** admin, operator, viewer (lectura)
- **Componentes:**
  - Vista grid o lista de servidores
  - Tarjetas con stats por servidor
  - Filtros: Todos, Healthy, Warning, Critical, Offline
  - Status badges
- **Datos por servidor:**
  ```javascript
  {
    id, name, ip, cpu, ram, disk, status,
    uptime, os, region, agent_version,
    last_heartbeat
  }
  ```
- **Estados:** healthy, warning, critical, offline
- **Mock data:** 8 servidores de ejemplo

#### 3. **SecurityPage** (`/security`)
- **Acceso:** admin, operator (lectura)
- **3 Tabs:**

  a) **Amenazas (Threats)**
  ```javascript
  {
    id, type, severity, source, target, time,
    count, status // blocked, mitigated, monitoring
  }
  ```
  - Tipos: Brute Force, SQL Injection, Port Scan, DDoS, XSS, Unauthorized Access
  - Severity: critical, warning, info
  - Status: blocked, mitigated, monitoring
  - Mock: 6 amenazas

  b) **Vulnerabilidades (Vulnerabilities)**
  ```javascript
  {
    id, cve, severity, component, description,
    status, patchDate // critical, high, medium, low
  }
  ```
  - Status: patched, pending, monitoring
  - Mock: 5 vulnerabilidades

  c) **Firewall Rules**
  ```javascript
  {
    id, name, type, source, entries, active
    // type: DENY, ALLOW, LIMIT
  }
  ```
  - Mock: 5 reglas

- **KPIs:**
  - Security Score (87/100)
  - Amenazas bloqueadas (últimas 24h)
  - Vulnerabilidades activas
  - Reglas firewall activas

#### 4. **AuditPage** (`/audit`)
- **Acceso:** admin, viewer (lectura)
- **Componentes:**
  - Tabla con logs de auditoría
  - Filtros por acción, estado, búsqueda
  - Export a CSV
  - Timeline de eventos críticos
- **Campos de log:**
  ```javascript
  {
    id, timestamp, user, action, resource, ip,
    status, details
    // actions: LOGIN, UPDATE, DELETE, CREATE, READ, DEPLOY, BACKUP, HEALTH, RESTART, ALERT
    // status: success, warning, critical
  }
  ```
- **Estadísticas:** Total, Exitosos, Advertencias, Críticos
- **Mock:** 15 registros

#### 5. **KPIsPage** (`/kpis`)
- **Acceso:** Todos
- Métricas agregadas y KPIs principales
- Gráficas de tendencias

#### 6. **SettingsPage** (`/settings`)
- **Acceso:** admin (solo)
- Configuración de la organización
- Preferencias del sistema
- Integraciones

#### 7. **UsersPage** (`/users`)
- **Acceso:** admin (solo)
- Gestión de usuarios de la organización
- Crear, editar, eliminar usuarios
- Rol y estado de usuarios
- Invite links
- **Campos:**
  ```javascript
  {
    id, name, email, role, status,
    lastAccess
    // role: admin, operator, viewer
    // status: active, inactive, invited
  }
  ```
- **Mock:** 5 usuarios

#### 8. **AgentSetupPage** (`/setup`)
- **Acceso:** Autenticados
- Setup guiado para instalar agentes
- Mostrar API_KEY para el agente
- Instrucciones de instalación
- Verificación de conexión

---

### 🎨 Componentes Reutilizables

#### 1. **GlassCard**
- Card base con efecto glassmorphism
- Props: `padding`, `glow`, `hover`, `children`, `className`
- Glow effects: cyan, amber, red, none

#### 2. **KpiCard**
- Card para mostrar KPIs
- Props: `title`, `value`, `subtitle`, `iconName`, `status`, `trend`
- Status: success, warning, danger, normal

#### 3. **StatusBadge**
- Badge de estado visual
- Props: `status`, `label`, `size`, `pulse`
- Status colors: healthy, warning, critical, info

#### 4. **DataTable**
- Tabla genérica con paginación
- Props: `columns`, `data`, `pageSize`
- Renderizado con motion animations

#### 5. **MetricsChart**
- Gráfica de líneas con Recharts
- Muestra CPU y RAM
- Animación y tooltip personalizado

#### 6. **Toast/Notification**
- Sistema de notificaciones
- useToast hook con success, error, warning
- Auto-dismiss en 3 segundos

#### 7. **Skeleton Loaders**
- Placeholders mientras cargan datos
- KpiCardSkeleton, ChartSkeleton

#### 8. **ProtectedRoute**
- HOC para proteger rutas
- Verifica autenticación y rol
- Redirige si no tiene permisos

---

### 🌍 Servicios (API Client)

#### authService
```javascript
{
  login(credentials),           // POST /auth/login
  logout(),                     // POST /auth/logout
  refreshToken(),               // POST /auth/refresh
  verifyToken()                 // GET /auth/verify
}
```

#### metricsService
```javascript
{
  getLatest(),                  // GET /metrics/latest
  getHistorical(timeRange),     // GET /metrics/historical?range=1h|6h|24h
  getKpis(),                    // GET /metrics/kpis
  getServerStatus()             // GET /metrics/servers
}
```

---

### 🏪 Store (Zustand)

#### authStore
```javascript
{
  state: {
    user: {email, role, token},
    isAuthenticated: boolean
  },
  actions: {
    login(userData),
    logout(),
    isTokenExpired(),
    getToken()
  }
}
```

Persistencia: localStorage con clave `auth-storage`

#### notificationStore
State para notificaciones toast

#### settingsStore
Preferencias del usuario (idioma, tema, etc)

---

### 🌐 Internacionalización (i18n)

**Soporta:** Español (es) e Inglés (en)

**Archivos de traducción:**
- `src/locales/es.json`
- `src/locales/en.json`

**Estructuras de traducción:**
```json
{
  "dashboard": {...},
  "resources": {...},
  "security": {...},
  "audit": {...},
  "users": {...},
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar"
  }
}
```

**Uso en componentes:**
```javascript
const { t } = useTranslation()
<h1>{t('dashboard.title')}</h1>
```

---

## Base de Datos SQL Propuesta

### 🔑 Análisis Derivado del Frontend

Basado en los datos mostrados en el frontend y las operaciones esperadas, aquí está la estructura SQL propuesta:

---

### 1. **Tabla: organizations**
Información de las organizaciones/empresas

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(20),  -- small, medium, large, enterprise
  subscription_tier VARCHAR(50),  -- free, pro, enterprise
  api_key VARCHAR(255) UNIQUE,
  status ENUM('active', 'suspended', 'trial') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

---

### 2. **Tabla: users**
Usuarios de la plataforma

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
  status ENUM('active', 'inactive', 'invited') NOT NULL DEFAULT 'active',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255) NULL,
  last_access TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT unique_org_email UNIQUE (organization_id, email),
  INDEX idx_organization_id (organization_id),
  INDEX idx_email (email)
);
```

---

### 3. **Tabla: sessions**
Sesiones activas y tokens

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  refresh_token TEXT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_token (token),
  INDEX idx_user_id_created (user_id, created_at)
);
```

---

### 4. **Tabla: servers** (Nodos/Recursos)
Servidores monitoreados

```sql
CREATE TABLE servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  hostname VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  ip_internal INET NULL,
  region VARCHAR(50),
  os VARCHAR(100),
  os_version VARCHAR(50),

  status ENUM('healthy', 'warning', 'critical', 'offline') DEFAULT 'offline',

  cpu_usage DECIMAL(5,2) DEFAULT 0,
  ram_usage DECIMAL(5,2) DEFAULT 0,
  disk_usage DECIMAL(5,2) DEFAULT 0,

  uptime_seconds BIGINT DEFAULT 0,
  agent_version VARCHAR(20) NULL,
  last_heartbeat TIMESTAMP NULL,
  last_metrics_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  INDEX idx_organization_id (organization_id),
  INDEX idx_status (status),
  INDEX idx_last_heartbeat (last_heartbeat),
  CONSTRAINT unique_org_hostname UNIQUE (organization_id, hostname)
);
```

---

### 5. **Tabla: metrics** (Time-Series)
Métricas de recursos en el tiempo

```sql
CREATE TABLE metrics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  server_id UUID NOT NULL,

  cpu_usage DECIMAL(5,2) NOT NULL,
  ram_usage DECIMAL(5,2) NOT NULL,
  disk_usage DECIMAL(5,2) NOT NULL,

  network_bytes_in BIGINT DEFAULT 0,
  network_bytes_out BIGINT DEFAULT 0,

  processes_count INT DEFAULT 0,
  tcp_connections INT DEFAULT 0,
  established_connections INT DEFAULT 0,

  response_time_ms INT DEFAULT 0,
  request_count INT DEFAULT 0,

  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (server_id) REFERENCES servers(id),
  INDEX idx_server_timestamp (server_id, timestamp),
  INDEX idx_timestamp (timestamp)

  -- NOTA: Considerar particionamiento por mes en timestamp para optimizar queries
);
```

---

### 6. **Tabla: alerts**
Alertas generadas

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  server_id UUID NULL REFERENCES servers(id),

  type ENUM('critical', 'warning', 'info') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,

  status ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',

  threshold_exceeded DECIMAL(5,2) NULL,
  threshold_value DECIMAL(5,2) NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP NULL,
  acknowledged_by UUID NULL REFERENCES users(id),
  resolved_at TIMESTAMP NULL,

  INDEX idx_organization_id (organization_id),
  INDEX idx_server_id (server_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

---

### 7. **Tabla: audit_logs**
Registro completo de auditoría

```sql
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NULL REFERENCES users(id),

  action VARCHAR(50) NOT NULL,  -- LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc
  resource_type VARCHAR(100),   -- users, servers, rules, settings
  resource_id VARCHAR(255) NULL,

  ip_address INET NOT NULL,
  user_agent TEXT NULL,

  status ENUM('success', 'warning', 'critical') DEFAULT 'success',
  error_message TEXT NULL,
  details JSON NULL,

  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_organization_id (organization_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
);
```

---

### 8. **Tabla: security_threats**
Amenazas detectadas

```sql
CREATE TABLE security_threats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  server_id UUID NULL REFERENCES servers(id),

  type VARCHAR(100) NOT NULL,  -- Brute Force, SQL Injection, Port Scan, etc
  severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,

  source_ip INET NULL,
  source_port INT NULL,
  target_port INT NULL,
  protocol VARCHAR(10),  -- TCP, UDP, ICMP

  description TEXT,

  status ENUM('blocked', 'mitigated', 'monitoring') DEFAULT 'monitoring',
  attempt_count INT DEFAULT 1,

  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  blocked_at TIMESTAMP NULL,

  INDEX idx_organization_id (organization_id),
  INDEX idx_severity (severity),
  INDEX idx_detected_at (detected_at)
);
```

---

### 9. **Tabla: vulnerabilities**
Vulnerabilidades encontradas

```sql
CREATE TABLE vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  server_id UUID NULL REFERENCES servers(id),

  cve_id VARCHAR(50),
  component VARCHAR(255),
  component_version VARCHAR(50),

  severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  description TEXT,

  status ENUM('patched', 'pending', 'monitoring') DEFAULT 'pending',

  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  patched_at TIMESTAMP NULL,

  INDEX idx_organization_id (organization_id),
  INDEX idx_severity (severity),
  INDEX idx_cve_id (cve_id)
);
```

---

### 10. **Tabla: firewall_rules**
Reglas de firewall

```sql
CREATE TABLE firewall_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),

  name VARCHAR(255) NOT NULL,
  description TEXT,

  protocol VARCHAR(10),  -- TCP, UDP, ICMP, ALL
  port_from INT NULL,
  port_to INT NULL,
  source_ip_range CIDR NULL,
  destination_ip_range CIDR NULL,

  action ENUM('allow', 'deny', 'rate_limit') NOT NULL,

  priority INT DEFAULT 100,
  enabled BOOLEAN DEFAULT TRUE,

  hit_count BIGINT DEFAULT 0,
  last_hit_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_organization_id (organization_id),
  INDEX idx_enabled (enabled),
  INDEX idx_priority (priority)
);
```

---

### 11. **Tabla: notifications**
Notificaciones para usuarios

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  type ENUM('critical', 'warning', 'success', 'info') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,

  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,

  action_url VARCHAR(255) NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id_read (user_id, read),
  INDEX idx_created_at (created_at)
);
```

---

### 12. **Tabla: security_events** (Datos del Agente)
Eventos de seguridad crudos del agente

```sql
CREATE TABLE security_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  server_id UUID NOT NULL REFERENCES servers(id),

  event_type VARCHAR(100),  -- connection, process, user_login, etc
  severity VARCHAR(20),     -- low, medium, high, critical

  source_ip INET NULL,
  source_port INT NULL,
  destination_ip INET NULL,
  destination_port INT NULL,

  process_name VARCHAR(255) NULL,
  process_pid INT NULL,
  user_name VARCHAR(100) NULL,

  details JSON,
  raw_data JSON,

  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_server_timestamp (server_id, timestamp),
  INDEX idx_event_type (event_type),
  INDEX idx_severity (severity)
);
```

---

### Índices Recomendados

```sql
-- Para queries de dashboard
CREATE INDEX idx_dashboard_metrics ON metrics(server_id, timestamp DESC);

-- Para queries de auditoría
CREATE INDEX idx_audit_search ON audit_logs(organization_id, timestamp DESC);

-- Para alerts en tiempo real
CREATE INDEX idx_alerts_active ON alerts(organization_id, status, created_at DESC);

-- Para búsquedas de amenazas
CREATE INDEX idx_threats_active ON security_threats(organization_id, status, detected_at DESC);
```

---

### Relaciones de Datos

```
organizations
├── 1:N → users (cada org puede tener múltiples usuarios)
├── 1:N → servers (cada org puede monitorear múltiples servidores)
├── 1:N → alerts (alertas generadas en el contexto de la org)
├── 1:N → audit_logs (todos los eventos de la org)
├── 1:N → security_threats (amenazas detectadas en la org)
├── 1:N → vulnerabilities
├── 1:N → firewall_rules
└── 1:N → notifications

servers
├── 1:N → metrics (histórico de métricas por servidor)
├── 1:N → alerts (alertas asociadas)
├── 1:N → security_events (eventos de seguridad)
├── 1:N → security_threats
└── 1:N → vulnerabilities

users
├── 1:N → sessions (múltiples sesiones activas)
├── 1:N → audit_logs (como actor)
├── 1:N → notifications (notificaciones dirigidas)
└── 1:N → alerts (como quien reconoció)

sessions
└── N:1 → users
```

---

## API - Endpoints Esperados

### Autenticación

```http
POST /auth/login
{
  "email": "admin@devsecops.com",
  "password": "password123"
}
RESPONSE 200:
{
  "token": "eyJhbGc...",
  "user": {
    "email": "admin@devsecops.com",
    "role": "admin",
    "id": "uuid"
  }
}
```

```http
POST /auth/logout
Authorization: Bearer token
RESPONSE 200:
{
  "message": "Logged out successfully"
}
```

```http
POST /auth/refresh
Authorization: Bearer token
RESPONSE 200:
{
  "token": "new_jwt_token"
}
```

```http
GET /auth/verify
Authorization: Bearer token
RESPONSE 200:
{
  "valid": true,
  "user": {
    "email": "admin@devsecops.com",
    "role": "admin"
  }
}
```

---

### Métricas

```http
GET /metrics/latest
Authorization: Bearer token
RESPONSE 200:
{
  "data": [
    {
      "cpu": 42.5,
      "ram": 65.3,
      "disk": 45.2,
      "server_id": "uuid",
      "timestamp": "2024-03-11T14:32:05Z"
    }
  ]
}
```

```http
GET /metrics/historical?range=1h&server_id=uuid
Authorization: Bearer token
RESPONSE 200:
{
  "data": [
    {"cpu": 40, "ram": 63, "timestamp": "..."},
    {"cpu": 42, "ram": 65, "timestamp": "..."},
    ...
  ]
}
```

```http
GET /metrics/kpis
Authorization: Bearer token
RESPONSE 200:
{
  "totalServers": 24,
  "healthyServers": 22,
  "criticalServers": 2,
  "uptime": 99.9,
  "alerts": 5,
  "responseTime": 120,
  "availability": 99.95
}
```

```http
GET /metrics/servers
Authorization: Bearer token
RESPONSE 200:
{
  "data": [
    {
      "id": "uuid",
      "hostname": "prod-api-01",
      "ip": "10.0.1.10",
      "status": "healthy",
      "cpu": 42,
      "ram": 65,
      "disk": 45,
      "os": "Ubuntu 22.04",
      "region": "US-East",
      "uptime": "45d 12h",
      "last_heartbeat": "2024-03-11T14:32:05Z"
    }
  ]
}
```

---

### Agente (Ingestion)

```http
POST /metrics (o /agent/metrics)
Authorization: Bearer api_key_from_agent
Content-Type: application/json
{
  "version": "1.0.0",
  "host": "prod-api-01",
  "ip": "10.0.1.10",
  "timestamp": "2024-03-11T14:32:05Z",
  "security": {
    "active_connections": [
      {"remote": "203.0.113.45:22", "pid": 1234}
    ],
    "logged_users": ["root", "appuser"]
  },
  "resources": {
    "cpu": 42.5,
    "ram": 65.3
  }
}
RESPONSE 200:
{
  "status": "received",
  "id": "metric_id"
}
```

---

### Users (Admin Only)

```http
GET /users
Authorization: Bearer token
RESPONSE 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@...",
      "role": "admin",
      "status": "active",
      "last_access": "2024-03-11T14:32:05Z"
    }
  ]
}

POST /users
{
  "name": "...",
  "email": "...",
  "role": "operator"
}
RESPONSE 201: {...}

PUT /users/:id
{...}
RESPONSE 200: {...}

DELETE /users/:id
RESPONSE 204
```

---

### Servers

```http
GET /servers
RESPONSE 200:
{
  "data": [
    {...}
  ]
}

POST /servers (registrar nuevo servidor)
{
  "hostname": "new-server",
  "ip_address": "10.0.1.100"
}
RESPONSE 201: {...}

PUT /servers/:id
RESPONSE 200: {...}

DELETE /servers/:id
RESPONSE 204
```

---

### Alerts

```http
GET /alerts
RESPONSE 200:
{
  "data": [...]
}

PUT /alerts/:id
{
  "status": "acknowledged"
}
RESPONSE 200: {...}
```

---

### Audit Logs

```http
GET /audit
RESPONSE 200:
{
  "data": [
    {
      "id": 1,
      "timestamp": "2024-03-11T14:32:05Z",
      "user": "admin@...",
      "action": "LOGIN",
      "resource": "Auth System",
      "ip": "192.168.1.100",
      "status": "success",
      "details": "..."
    }
  ]
}
```

---

### Security

```http
GET /security/threats
RESPONSE 200:
{
  "data": [...]
}

GET /security/vulnerabilities
RESPONSE 200:
{
  "data": [...]
}

GET /security/firewall-rules
RESPONSE 200:
{
  "data": [...]
}

POST /security/firewall-rules
{...}
RESPONSE 201: {...}

PUT /security/firewall-rules/:id
{...}
RESPONSE 200: {...}
```

---

## Autenticación y RBAC

### 🔐 Sistema de Autenticación

**Tipo:** JWT (JSON Web Token)

**Flow:**
1. Usuario inicia sesión con email/password
2. Backend valida en DB
3. Genera JWT token con `exp` claim
4. Frontend almacena en localStorage bajo clave `auth-storage`
5. Token se envía en header `Authorization: Bearer token`

**Token Estructura (typical JWT):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "email": "user@example.com",
    "role": "admin",
    "org_id": "org_uuid",
    "iat": 1234567890,
    "exp": 1234571490  // 1 hora de expiración
  },
  "signature": "..."
}
```

**Validación en Frontend:**
```javascript
// authStore.js
isTokenExpired = () => {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload.exp < (Date.now() / 1000)
}
```

### 👥 Roles y Permisos

| Recurso | Admin | Operator | Viewer |
|---------|-------|----------|--------|
| Dashboard | R | R | R |
| Resources | RW | R | R |
| KPIs | RW | R | R |
| Audit | RW | - | R |
| Security | RW | RW | - |
| Settings | RW | - | - |
| Users | RW | - | - |
| Agent Setup | RW | R | - |

**Leyenda:**
- R = Read (Lectura)
- RW = Read/Write (Lectura y Escritura)
- \- = Sin acceso

### 🔒 Protección de Rutas

```javascript
// ProtectedRoute.jsx
<ProtectedRoute allowedRoles={['admin', 'operator']}>
  <Component />
</ProtectedRoute>
```

Si el usuario:
- No está autenticado → Redirige a `/login`
- Está autenticado pero rol no permitido → Redirige a `/dashboard`
- Rol permitido → Muestra página

---

## Internacionalización (i18n)

### 🌐 Idiomas Soportados

- **Español** (es) - Idioma por defecto
- **Inglés** (en)

### 📁 Estructura de Traducciones

```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "export": "Exportar"
  },
  "dashboard": {
    "title": "Command Center",
    "subtitle": "Monitoreo en tiempo real"
  },
  "resources": {
    "title": "Infraestructura",
    "subtitle": "Monitoreo y gestión de recursos",
    "healthy": "Saludable",
    "offline": "Desconectado"
  },
  "security": {
    "title": "Centro de Seguridad",
    "threats": "Amenazas",
    "vulnerabilities": "Vulnerabilidades",
    "firewall": "Firewall"
  },
  "audit": {
    "title": "Auditoría",
    "exportCSV": "Descargar CSV",
    "exportSuccess": "Exportado exitosamente"
  },
  "users": {
    "title": "Usuarios",
    "addUser": "Añadir Usuario",
    "admin": "Administrador",
    "operator": "Operador",
    "viewer": "Visualizador"
  }
}
```

### 🔄 Cambio de Idioma

```javascript
import { useTranslation } from 'react-i18next'

const { i18n, t } = useTranslation()

// Cambiar idioma
i18n.changeLanguage('en')

// Usar traducción
<h1>{t('dashboard.title')}</h1>
```

---

## 📊 Estadísticas y Métricas Clave

### KPIs del Dashboard

```javascript
{
  // Servidores
  totalServers: 24,          // Total de servidores monitoreados
  healthyServers: 22,        // Servidores en estado saludable
  warningServers: 2,         // Servidores con advertencias
  criticalServers: 0,        // Servidores en estado crítico
  offlineServers: 0,         // Servidores desconectados

  // Performance
  uptime: 99.9,              // Porcentaje de disponibilidad
  responseTime: 120,         // Respuesta promedio en ms
  throughput: 5000,          // Requests por segundo

  // Seguridad
  alerts: 5,                 // Alertas activas
  blockedThreats: 70,        // Amenazas bloqueadas en 24h
  vulnerabilities: 5,        // Vulnerabilidades encontradas
  criticalVulnerabilities: 1,// Vulnerabilidades críticas

  // Firewall
  firewallRulesActive: 4,    // Reglas de firewall activas
  firewallRulesTotal: 5,     // Total de reglas

  // Usuarios
  activeUsers: 3,            // Usuarios con sesión activa
  totalUsers: 5              // Total de usuarios en org
}
```

---

## 🔌 Configuración de Desarrollo

### Variables de Entorno Esperadas

**Backend `.env`:**
```bash
DATABASE_URL=mysql://db_admin:password@localhost:3308/dashboard_db
JWT_SECRET=your_secret_key_here
API_KEY_SALT=salt_for_agent_keys
CORS_ORIGIN=http://localhost:5173
PORT=8080
```

**Frontend `.env`:**
```bash
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=HawkScope SOC
VITE_APP_VERSION=2.0.0
```

**Agente `.env`:**
```bash
API_URL=http://localhost:8080/api/metrics
API_KEY=your_agent_api_key
MONITOR_INTERVAL=30
```

---

## 🚀 Flujo de Desarrollo

### 1. Configuración Inicial

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Database
docker-compose up -d
# Luego ejecutar:
# mysql -h localhost -P 3308 -u db_admin -p < database/init.sql
```

### 2. Desarrollo Frontend

```bash
cd frontend
npm run dev
# Abre http://localhost:5173
```

### 3. Testing de API

```bash
# Usando el cliente Axios en authService/metricsService
# Las requests se hacen a http://localhost:8080/api
```

---

## 📝 Notas Importantes

### Frontend

1. **Mock Data:** Actualmente usa datos mockados en lugar de llamadas reales
2. **Error Handling:** Cuando falla una llamada a API, usa datos mockados como fallback
3. **Auto-refresh:** Dashboard se actualiza cada 10 segundos silenciosamente
4. **LocalStorage:** Tokens se persisten en `auth-storage`
5. **Glass Morphism:** Diseño visual con efectos glassmorphism
6. **Responsive:** Mobile-first design con Tailwind CSS

### Backend (Por Implementar)

1. Debe crear endpoints para todas las rutas de metricsService y authService
2. Implementar autenticación JWT con validación de tokens
3. Implementar rate limiting para proteger la API
4. Implementar validación de schema para ingesta de métricas del agente
5. Implementar logs de auditoría para todas las operaciones

### Base de Datos

1. Las tablas propuestas están optimizadas para queries de lectura (dashboards)
2. Considerar índices adicionales según carga real
3. Para métricas, considerar time-series DB (InfluxDB, TimescaleDB) en producción
4. Implementar políticas de retención de datos (rotación de logs)

### Agente

1. Implementar reconexión automática si falla la conexión
2. Implementar buffer local si no hay conectividad
3. Implementar encriptación de datos en tránsito (HTTPS obligatorio)
4. Implementar rotating logs

---

## 🎯 Próximos Pasos

1. **Implementar Backend:** Crear servidor API con endpoints listados
2. **Conectar Frontend:** Cambiar de mock data a llamadas reales
3. **Implementar BD:** Crear tablas SQL propuestas
4. **Testing:** Unit tests, integration tests
5. **Deployment:** CI/CD pipeline, deployment a producción
6. **Monitoring:** Implementar logging y monitoring del sistema
7. **Seguridad:** Auditoría de seguridad, penetration testing

---

**Documento generado automáticamente - Válido hasta última actualización del proyecto**
