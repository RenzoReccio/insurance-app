# Insurance Suite - Microservices & Platform

Plataforma integral de microservicios para la gestión aseguradora moderna, compuesta por un **Motor de Traducción de Endosos Dinámicos** (Node.js / Hapi / TypeORM), un **Servicio de Enrutamiento Óptimo de Grúas** (Golang / Multi-Source Dijkstra), un **Dashboard Ejecutivo Web** (React / TypeScript / Vite) y almacenamiento relacional en **PostgreSQL**.

---

## 🏛️ Arquitectura General del Sistema

El ecosistema está diseñado como una arquitectura de microservicios desacoplados, contenerizados y preparados tanto para orquestación local con Docker Compose como para despliegue serverless en la nube:

```
                             ┌─────────────────────────────────┐
                             │   Frontend SPA (React + Vite)   │
                             │   Cloud Run / Localhost:5173    │
                             └───────────────┬─────────────────┘
                                             │
                    ┌────────────────────────┴────────────────────────┐
                    │ (HTTP REST / JSON / JWT Bearer)                 │
                    ▼                                                 ▼
   ┌─────────────────────────────────┐               ┌─────────────────────────────────┐
   │  insurance-node-backend (:3000) │               │ insurance-golang-backend (:8080)│
   │      Traductor de Endosos       │               │      Rutas Óptimas (Grúas)      │
   │    (Hapi.js + TypeORM + Joi)    │               │   (Go 1.23 + Dijkstra Heap)     │
   └────────────────┬────────────────┘               └─────────────────────────────────┘
                    │
                    │ PostgreSQL Protocol (SSL / Port 5432)
                    ▼
   ┌─────────────────────────────────┐
   │    PostgreSQL (Local / Cloud)   │
   │  Supabase Pooler (Port 5432)    │
   └─────────────────────────────────┘
```

<details>
<summary><b>Ver Diagrama Mermaid interactivo (GitHub)</b></summary>

```mermaid
graph TD
    Client(["🌐 Navegador Web / Cliente"]) -->|"HTTPS REST / JWT"| Frontend["📱 Frontend SPA<br/>(React 18 + Vite + Nginx)"]
    Frontend -->|"POST /v1/endorse/translate<br/>Bearer JWT"| NodeBackend["🟢 node-backend (:3000)<br/>Traductor de Endosos<br/>(Hapi.js + TypeORM + Joi)"]
    Frontend -->|"POST /v1/routes/optimal<br/>Bearer JWT"| GoBackend["🔵 golang-backend (:8080)<br/>Rutas Óptimas Grúas<br/>(Go 1.23 + Dijkstra Heap)"]
    NodeBackend -->|"PostgreSQL Protocol<br/>(SSL / Port 5432)"| Database[("🗄️ PostgreSQL Database<br/>(Local o Supabase Cloud)")]
```
</details>

### Servicios del Proyecto

| Servicio | Directorio | Stack Tecnológico | Puerto | Responsabilidad Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `frontend/` | React 18, TypeScript, Vite, Lucide Icons, Nginx | `5173` | Dashboard interactivo con vistas para traducción de endosos y simulación de rutas de grúas. |
| **Node Backend** | `node-backend/` | Node.js v20, @hapi/hapi, TypeORM, Joi, JWT | `3000` | Transformación de payloads planos de endoso a esquemas jerárquicos ordenados mediante plantillas relacionales. |
| **Golang Backend** | `golang-backend/` | Go 1.23, `container/heap`, JWT, net/http | `8080` | Algoritmo de Dijkstra multi-origen para selección y cálculo de ruta mínima de grúas hacia siniestros vehiculares. |
| **Database** | `postgres/` | PostgreSQL 15 Alpine | `5432` | Almacenamiento de productos, tipos de endoso y metadatos de configuración dinámica de campos y eventos. |

---

## 📦 Componentes y Módulos

### 1. Motor Traductor de Endosos (`node-backend`)
Diseñado para la iniciativa **Evolution (Endosos Sencillos)**. Resuelve el mapeo de solicitudes de pólizas hacia el núcleo asegurador core.

- **Arquitectura en capas:**
  1. **Routes Layer (`@hapi/hapi`)**: Definición de endpoints, validaciones Joi y autenticación JWT.
  2. **Controller Layer**: Manejo de requests/responses HTTP y orquestación de servicios.
  3. **Service Layer (`EndorsementTranslatorService`)**: Consulta de plantillas dinámicas por `(producto, tipoEndoso)` y publicación de eventos.
  4. **Mapper Layer (`EndorsementCoreMapper`)**: Inyección de campos estáticos/dinámicos (`dynamicData`), ordenamiento estricto y resolución de valores por defecto.
  5. **Repository Layer (TypeORM)**: Acceso a entidades de PostgreSQL.
  6. **Publisher Layer**: Publicación de eventos de dominio (`ConsoleEventPublisher` / interfaces desacopladas).

- **Modelo Relacional de Plantillas Dinámicas (ERD):**
  Permite agregar nuevos productos y tipos de endoso sin modificar código fuente:
  - `products`: Catálogo de productos (ej. `Rumbo`).
  - `endorsement_types`: Catálogo de endosos (ej. `CambioFrecuencia`).
  - `endorsement_templates`: Asociación producto-endoso y configuración de evento raíz.
  - `template_field_configs`: Diccionario de campos `dynamicData` (`source_field`, `default_value`, `display_order`, `is_required`).
  - `template_event_configs`: Definición de eventos aplicados (`eventAppliedEntities`).

  ![Diagrama Entidad-Relación (ERD)](./ERD.png)

---

### 2. Servicio de Rutas Óptimas para Grúas (`golang-backend`)
Microservicio autónomo de alto rendimiento implementado en Go 1.23.

- **Algoritmo Multi-Source Dijkstra:**
  - Emplea una cola de prioridad basada en `container/heap` con complejidad computacional óptima $\mathcal{O}((V + E) \log V)$.
  - Inicializa múltiples depósitos de grúas simultáneamente con costo 0, garantizando encontrar la grúa más cercana y reconstruir el camino mínimo exacto hacia el lugar del siniestro.
- **Topología de Red Vial (Lima):**
  - Integra por defecto la red de distritos interconectados: Miraflores, San Isidro, Barranco, Lince, Surco y Ate.
  - Admite grafos personalizados dinámicos enviados en el payload de la petición.
- **Códigos de Respuesta Controlados:**
  - `200 OK`: Retorna el depósito de origen asignado, costo/distancia total y la secuencia ordenada de nodos navegados.
  - `400 Bad Request`: Validaciones de entrada (sin depósitos, destino no especificado o formato inválido).
  - `422 Unprocessable Entity`: Detección de destino inalcanzable (grafo inconexo o nodo aislado).

---

### 3. Dashboard Web SPA (`frontend`)
Aplicación web moderna y reactiva desarrollada con React 18, TypeScript y Vite.

- **Pestaña 1: Traductor de Endosos**
  - Formulario de entrada de póliza con presets preconfigurados (Cambio de Frecuencia Rumbo, etc.).
  - Generador e inyector automático de tokens JWT de sesión.
  - Comparador visual de payload de entrada vs. JSON estructurado core generado.
- **Pestaña 2: Rutas Óptimas de Grúas**
  - Selector interactivo de distrito de siniestro (destino) y bases de grúas disponibles (depósitos múltiples).
  - Presets de prueba inmediata: Caso PDF Oficial, Emergencia Este, Mismo Distrito y Destino Inalcanzable (422).
  - Editor interactivo de grafo JSON para simular rutas y contingencias viales personalizadas.
  - Métricas de despacho, tiempo de respuesta en milisegundos y visualización de la secuencia de pasos de la ruta.

---

## ☁️ Arquitectura y Despliegue en la Nube (Google Cloud Run & Supabase)

La plataforma está completamente preparada para operar en producción serverless con alta disponibilidad, auto-escalado a cero y separación estricta de responsabilidades.

### Topología de Despliegue Cloud

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENTES & NAVEGADORES WEB                            │
│                             💻 Usuario / Operador Web                            │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTPS (Puerto 443)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│              GOOGLE CLOUD PLATFORM (Region: us-central1 | Project: swgpeqn)      │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                         ⚡ GOOGLE CLOUD RUN                              │   │
│   │                                                                          │   │
│   │  ┌────────────────────────┐              ┌────────────────────────────┐  │   │
│   │  │   insurance-frontend   │──(HTTPS/JWT)─│   insurance-node-backend   │  │   │
│   │  │   • Nginx Alpine :8080 │              │   • Hapi.js + TypeORM      │  │   │
│   │  │   • SPA React + Vite   │──(HTTPS/JWT)─│   • Port: $PORT / 3000     │  │   │
│   │  └────────────────────────┘              └─────────────┬──────────────┘  │   │
│   │                │                                       │                 │   │
│   │                │                                       │ SSL Pooler      │   │
│   │                ▼                                       │ (Port 5432)     │   │
│   │  ┌────────────────────────┐                            │                 │   │
│   │  │insurance-golang-backend│                            │                 │   │
│   │  │ • Go 1.23 (~15MB)      │                            │                 │   │
│   │  │ • Dijkstra Multi-Source│                            │                 │   │
│   │  └────────────────────────┘                            │                 │   │
│   └────────────────────────────────────────────────────────┼─────────────────┘   │
└────────────────────────────────────────────────────────────┼─────────────────────┘
                                                             │
                                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                     SUPABASE MANAGED POSTGRESQL (AWS us-west-2)                  │
│                                                                                  │
│  🔌 Connection Pooler (Supavisor - Port 5432 / Session Mode / SSL Encriptado)    │
│  🐘 PostgreSQL 15 Engine: products, endorsement_types, templates, dynamic fields │
└──────────────────────────────────────────────────────────────────────────────────┘
```

<details>
<summary><b>Ver Diagrama Mermaid interactivo (GitHub)</b></summary>

```mermaid
flowchart TB
    subgraph Users ["🌍 Clientes & Navegadores"]
        Browser["💻 Usuario / Operador Web"]
    end

    subgraph GCP ["☁️ Google Cloud Platform (Project: swgpeqn | us-central1)"]
        subgraph CloudRun ["⚡ Google Cloud Run (Serverless Containers)"]
            direction TB
            CR_FE["📱 insurance-frontend<br/>• Runtime: Nginx Alpine<br/>• Puerto: 8080<br/>• Ingress: All (HTTPS)<br/>• SPA Bundle (React + Vite)"]
            CR_NODE["🟢 insurance-node-backend<br/>• Runtime: Node.js 20<br/>• Puerto: 3000 / $PORT<br/>• Auto-Migration & Auto-Seed<br/>• API Traductor de Endosos"]
            CR_GO["🔵 insurance-golang-backend<br/>• Runtime: Alpine Binary (~15MB)<br/>• Puerto: 8080 / $PORT<br/>• Stateless Dijkstra Algorithm<br/>• API Rutas Óptimas de Grúas"]
        end

        subgraph GCR ["📦 Container Registry"]
            Registry["gcr.io/swgpeqn/insurance-frontend"]
        end
    end

    subgraph SupabaseCloud ["⚡ Supabase Managed Cloud (AWS us-west-2)"]
        DB_POOLER["🔌 Connection Pooler (Supavisor)<br/>Port: 5432 (Session Mode) / SSL Require"]
        DB_CORE[("🐘 PostgreSQL 15 Engine<br/>• products<br/>• endorsement_types<br/>• endorsement_templates<br/>• template_field_configs<br/>• template_event_configs")]
        DB_POOLER --> DB_CORE
    end

    Browser -->|"1. Carga SPA (HTTPS)"| CR_FE
    Browser -->|"2. POST /v1/endorse/translate (Bearer JWT)"| CR_NODE
    Browser -->|"3. POST /v1/routes/optimal (Bearer JWT)"| CR_GO
    CR_NODE -->|"Conexión segura SSL (DATABASE_URL)"| DB_POOLER
    Registry -.->|"Despliega Imagen Contenerizada"| CR_FE
```
</details>

### Componentes y Estrategia de Despliegue

| Componente | Plataforma de Ejecución | Especificaciones de Despliegue | Configuración Clave |
| :--- | :--- | :--- | :--- |
| **`frontend`** | Google Cloud Run | Contenedor Nginx Alpine sirviendo el bundle compilado de Vite. Escucha en el puerto `8080` (estándar de Cloud Run) y `80`. | Construido con `--build-arg VITE_API_URL` y `--build-arg VITE_GO_API_URL` apuntando a los dominios públicos HTTPS de Cloud Run. |
| **`node-backend`** | Google Cloud Run | Microservicio Hapi.js en Node 20. Despliegue directo mediante `--source .`. Escucha dinámicamente en el puerto asignado por Cloud Run (`$PORT`). | Conectado a Supabase vía `DATABASE_URL` (Connection Pooler con SSL `rejectUnauthorized: false`). `DB_SYNCHRONIZE=true` y auto-seed automático en el primer arranque. |
| **`golang-backend`** | Google Cloud Run | Microservicio compilado estáticamente en CGO-free Go 1.23 sobre Alpine 3.20 (~15MB). Arranque instantáneo (<100ms) y autoescalado a 0. | Escucha en `$PORT` (8080 por defecto), CORS habilitado universalmente y validación de firma JWT compartida vía `JWT_SECRET`. |
| **`database`** | Supabase (Free Tier) | PostgreSQL 15 administrado en la nube con Connection Pooler (Supavisor). | Modo de conexión **Session Pooler (Puerto 5432)** con soporte IPv4, evitando bloqueos de red IPv6 en Cloud Run. |

### Flujo de Ejecución End-to-End

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                       ESCENARIO A: TRADUCCIÓN DE ENDOSO A JSON CORE                      │
│                                                                                          │
│  [1. Póliza]            [2. Token JWT]                 [4. Plantilla]                    │
│  Usuario ──────> Frontend ──────> node-backend ──────> Supabase                          │
│                    │                  │                   │                              │
│                    │                  │ <─(Metadatos)─────┘                              │
│                    │                  ▼                                                  │
│                    │           [5. Mapeo estricto core]                                  │
│                    │ <─(200 OK JSON)──┘                                                  │
│  Usuario <─────────┘                                                                     │
│  [6. Comparador]                                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                       ESCENARIO B: CÁLCULO DE RUTA ÓPTIMA DE GRÚAS                       │
│                                                                                          │
│  [1. Siniestro & Grúas]        [2. POST /v1/routes/optimal + JWT]                        │
│  Usuario ────────────> Frontend ─────────────────────────> golang-backend                │
│                           │                                      │                       │
│                           │                                      ▼                       │
│                           │                              [3. Multi-Source]               │
│                           │                              [   Dijkstra Heap]              │
│                           │ <──────(200 OK Ruta mínima)──────────┘                       │
│  Usuario <────────────────┘                                                              │
│  [4. Despacho y Mapa]                                                                    │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

<details>
<summary><b>Ver Diagrama de Secuencia Mermaid interactivo (GitHub)</b></summary>

```mermaid
sequenceDiagram
    autonumber
    actor User as Operador / Usuario
    participant FE as Frontend SPA (Cloud Run)
    participant Node as node-backend (Cloud Run)
    participant Go as golang-backend (Cloud Run)
    participant DB as Supabase PostgreSQL

    Note over User, FE: Escenario A: Traducción de Endoso a JSON Core
    User->>FE: Ingresa póliza y presiona "Traducir Endoso"
    FE->>Node: POST /v1/auth/token (Solicita JWT)
    Node-->>FE: 200 OK { token }
    FE->>Node: POST /v1/endorse/translate (Payload plano + JWT Bearer)
    Node->>DB: SELECT plantilla por producto y tipo de endoso
    DB-->>Node: Metadatos de campos dinámicos y eventos aplicados
    Node->>Node: Mapea y ordena estrictamente dynamicData y eventAppliedEntities
    Node-->>FE: 200 OK (Payload JSON estructurado core)
    FE-->>User: Muestra payload transformado y comparador en pantalla

    Note over User, Go: Escenario B: Cálculo de Ruta Óptima de Grúas
    User->>FE: Selecciona bases de grúas y siniestro
    FE->>Go: POST /v1/routes/optimal (Grafo vial + Depósitos + Destino + JWT)
    Go->>Go: Ejecuta Multi-Source Dijkstra sobre priority queue (container/heap)
    Go-->>FE: 200 OK { origen asignado, costo total, pasos de ruta }
    FE-->>User: Renderiza métricas de despacho y camino óptimo
```
</details>

### Guía de Despliegue en Cloud Run (PowerShell)

#### 1. Configuración Inicial del Entorno
```powershell
# Cargar gcloud al PATH de la sesión actual
$env:Path = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin;" + $env:Path

# Autenticación y configuración del proyecto GCP
gcloud auth login
gcloud config set project swgpeqn
```

#### 2. Despliegue de `golang-backend`
```powershell
Set-Location .\golang-backend

gcloud run deploy insurance-golang-backend `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars JWT_SECRET=evolution-secret-key-2026-very-secure
```
> Copiar la URL pública generada (ej. `https://insurance-golang-backend-736264852423.us-central1.run.app`).

#### 3. Despliegue de `node-backend` conectado a Supabase
```powershell
Set-Location ..\node-backend

gcloud run deploy insurance-node-backend `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  "--set-env-vars=DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres,DB_SYNCHRONIZE=true,JWT_SECRET=evolution-secret-key-2026-very-secure"
```
> Copiar la URL pública generada (ej. `https://insurance-node-backend-736264852423.us-central1.run.app`).

#### 4. Compilación y Despliegue de `frontend`
```powershell
Set-Location ..\frontend

# Autenticar Docker con Google Container Registry
gcloud auth configure-docker

# Compilar imagen inyectando las URLs de los microservicios Cloud Run
docker build `
  --build-arg VITE_API_URL="https://insurance-node-backend-736264852423.us-central1.run.app" `
  --build-arg VITE_GO_API_URL="https://insurance-golang-backend-736264852423.us-central1.run.app" `
  -t "gcr.io/swgpeqn/insurance-frontend:latest" .

# Subir imagen al registro
docker push "gcr.io/swgpeqn/insurance-frontend:latest"

# Desplegar en Cloud Run exponiendo el puerto 8080
gcloud run deploy insurance-frontend `
  --image "gcr.io/swgpeqn/insurance-frontend:latest" `
  --region us-central1 `
  --port 8080 `
  --allow-unauthenticated
```

---

## 🚀 Inicio Rápido con Docker Compose (Local)

La forma recomendada de ejecutar toda la plataforma (Base de datos, Backend Node, Backend Go y Frontend):

```bash
docker compose up -d --build
```

### Acceso a los Servicios

Una vez levantados los contenedores:

| Aplicación / Servicio | URL / Endpoint |
| :--- | :--- |
| **Dashboard Web (Frontend)** | [http://localhost:5173](http://localhost:5173) |
| **Traductor API (Node.js)** | [http://localhost:3000](http://localhost:3000) |
| **Rutas Óptimas API (Golang)** | [http://localhost:8080](http://localhost:8080) |
| **PostgreSQL Database** | `localhost:5432` (`insurance_db` / `postgres:postgres`) |

### Verificación de Health Checks

```bash
# Health check Node.js
curl http://localhost:3000/health

# Health check Golang
curl http://localhost:8080/health
```

---

## 💻 Desarrollo Local (Sin Docker)

### Requisitos Previos
- **Node.js** v20+ y **npm**
- **Go** v1.23+
- **PostgreSQL** 15+ ejecutándose localmente con base de datos `insurance_db`

---

### 1. Configuración de Base de Datos y Node Backend

```bash
cd node-backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Ajustar DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD según tu entorno

# 3. Ejecutar migraciones / inicialización y seeds
npm run seed

# 4. Iniciar en modo desarrollo
npm run dev
```

El servicio estará disponible en `http://localhost:3000`.

---

### 2. Configuración de Golang Backend

```bash
cd golang-backend

# 1. Descargar dependencias
go mod download

# 2. Iniciar servidor
go run cmd/server/main.go
```

El microservicio escuchará en `http://localhost:8080`.

---

### 3. Configuración del Frontend

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor Vite de desarrollo
npm run dev
```

La interfaz gráfica estará disponible en `http://localhost:5173`.

---

## 📡 Referencia de API & Ejemplos cURL

### A. Endosos (Node.js Backend - `:3000`)

#### 1. Obtener Token JWT
```bash
curl -X POST http://localhost:3000/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "interface.servicios",
    "role": "service"
  }'
```

#### 2. Traducir Solicitud de Endoso
```bash
curl -X POST http://localhost:3000/v1/endorse/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_OBTENIDO>" \
  -d '{
    "policyNumber": "08200000049",
    "idEnvio": 5984,
    "frecuencia": "Semestral",
    "tipoEndoso": "CambioFrecuencia",
    "producto": "Rumbo",
    "plan": "PlanRumbo",
    "moneda": "Nuevo Sol",
    "usuario": "interface.servicios",
    "fechaSolicitud": "2025-08-27",
    "fechaCliente": "2025-08-27",
    "fechaEfectiva": "2025-09-01"
  }'
```

*Respuesta esperada (HTTP 200):*
```json
{
  "policyNumber": "08200000049",
  "idEnvio": 5984,
  "financialPlansEntity": { "description": "Semestral" },
  "currency": { "description": "Nuevo Sol" },
  "productEntity": { "description": "Rumbo" },
  "eventEntity": {
    "description": "SolicitarEndoso",
    "dynamicData": [
      { "etiqueta": "ProductosVida", "value": "Rumbo" },
      { "etiqueta": "NombreUsuario", "value": "interface.servicios" },
      { "etiqueta": "NumeroPolizaEndoso", "value": "08200000049" },
      { "etiqueta": "TipoEndosoPol", "value": "Endoso Simple" },
      { "etiqueta": "ResponsableAtencion", "value": "SAC" },
      { "etiqueta": "EndosoModifPrima", "value": "Si" },
      { "etiqueta": "InicioVigenciaEndoso", "value": "Default" },
      { "etiqueta": "TipoVigenciaEndoso", "value": "" },
      { "etiqueta": "EndososSimplesSACRumbo", "value": "TES008" },
      { "etiqueta": "FechaSolicitud", "value": "2025-08-27" },
      { "etiqueta": "FechaCliente", "value": "2025-08-27" },
      { "etiqueta": "FechaEfectiva", "value": "2025-09-01" }
    ]
  },
  "eventAppliedEntities": [
    { "description": "SolicitarEndoso", "orderEvent": 1 },
    { "description": "AprobarEndoso", "orderEvent": 2 }
  ],
  "riskUnitEntities": [
    {
      "insuranceObjectEntities": [
        { "insuranceObjectNumber": "1", "coverageEntities": [], "participationEntities": [] }
      ],
      "plansEntity": { "description": "PlanRumbo" },
      "riskUnitNumber": "1"
    }
  ],
  "participationEntities": []
}
```

---

### B. Rutas Óptimas de Grúas (Golang Backend - `:8080`)

#### 1. Obtener Token JWT
```bash
curl -X POST http://localhost:8080/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dispatch.operator",
    "role": "operator"
  }'
```

#### 2. Calcular Ruta Óptima (Multi-Source Dijkstra)
```bash
curl -X POST http://localhost:8080/v1/routes/optimal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_OBTENIDO>" \
  -d '{
    "depots": ["Miraflores", "Ate"],
    "accidentLocation": "San Isidro"
  }'
```

*Respuesta esperada (HTTP 200):*
```json
{
  "fromDepot": "Miraflores",
  "to": "San Isidro",
  "distance": 7,
  "path": [
    "Miraflores",
    "Lince",
    "San Isidro"
  ]
}
```
*(Cálculo: Miraflores $\to$ Lince (4) $\to$ San Isidro (3) = 7 km/min vs. camino directo 10 km/min).*

#### 3. Simulación con Grafo Personalizado
Es posible enviar una topología vial arbitraria en el payload mediante el campo `graph`:
```bash
curl -X POST http://localhost:8080/v1/routes/optimal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_OBTENIDO>" \
  -d '{
    "depots": ["BaseNorte", "BaseSur"],
    "accidentLocation": "Centro",
    "graph": {
      "BaseNorte": { "Centro": 12, "Periferia": 3 },
      "BaseSur": { "Centro": 8 },
      "Periferia": { "Centro": 4 },
      "Centro": {}
    }
  }'
```

---

## 🧪 Pruebas Automatizadas

### Pruebas de Node.js Backend
```bash
cd node-backend
# Ejecutar todas las pruebas con Jest
npm test

# Ejecutar únicamente pruebas unitarias
npm run test:unit

# Ejecutar pruebas de integración
npm run test:e2e
```

### Pruebas de Golang Backend
```bash
cd golang-backend
# Ejecutar pruebas unitarias y e2e con cobertura
go test ./... -v -cover
```

### Verificación del Frontend
```bash
cd frontend
# Validar tipado TypeScript y compilar bundle de producción
npm run build
```

---

## 📁 Estructura del Repositorio

```
insurance-app/
├── docker-compose.yml             # Orquestación multicontenedor (Postgres, Node, Go, Frontend)
├── ERD.png                        # Diagrama Entidad-Relación (Base de datos PostgreSQL)
├── README.md                      # Documentación integral del proyecto
├── frontend/                      # Single Page Application (React + Vite)
│   ├── src/
│   │   ├── api/                   # Clientes HTTP (Node y Go)
│   │   ├── components/            # Componentes UI (Header, Tabs, CodeViewer)
│   │   ├── views/                 # Vistas: EndorseTranslatorView y OptimalRouteView
│   │   └── styles/                # Estilos globales y tokens CSS
│   ├── Dockerfile                 # Contenedor multi-stage con Nginx
│   └── package.json
├── golang-backend/                # Microservicio de Rutas Óptimas (Go 1.23)
│   ├── cmd/server/main.go         # Entrypoint HTTP y registro de rutas
│   ├── internal/
│   │   ├── algorithm/             # Dijkstra multi-origen con cola de prioridad
│   │   ├── handler/               # Controladores HTTP de rutas y autenticación
│   │   ├── middleware/            # Guard JWT y CORS
│   │   ├── model/                 # Estructuras de Request/Response y Grafo
│   │   └── service/               # Lógica de orquestación de rutas
│   ├── tests/                     # Suite de pruebas E2E en Go
│   └── Dockerfile                 # Contenedor multi-stage Alpine
└── node-backend/                  # Microservicio Traductor de Endosos (Node.js)
    ├── src/
    │   ├── controllers/           # EndorseController y AuthController
    │   ├── entities/              # Entidades TypeORM para PostgreSQL
    │   ├── mappers/               # Motor de transformación y DynamicData
    │   ├── repositories/          # Acceso a plantillas y productos
    │   ├── routes/                # Definición de rutas Hapi y esquemas Joi
    │   ├── scripts/seed.ts        # Poblador inicial de la base de datos
    │   └── server.ts              # Configuración y arranque del servidor Hapi
    ├── tests/                     # Pruebas unitarias y de integración Jest
    └── Dockerfile                 # Contenedor Node.js 20
```

---

## 🔒 Variables de Entorno

### `node-backend`
| Variable | Descripción | Valor por Defecto (Local / Docker) | Configuración en Producción (Cloud Run) |
| :--- | :--- | :--- | :--- |
| `PORT` | Puerto de escucha HTTP | `3000` | Inyectado automáticamente por Cloud Run (`8080`) |
| `DATABASE_URL` | URI de conexión completa a PostgreSQL | *(Opcional en local)* | `postgresql://postgres.[REF]:[PASS]@[HOST]:5432/postgres` (Supabase Pooler) |
| `DB_HOST` | Host de PostgreSQL (si no se usa `DATABASE_URL`) | `postgres` o `localhost` | - |
| `DB_PORT` | Puerto de PostgreSQL | `5432` | `5432` (Session Pooler) |
| `DB_USERNAME` | Usuario de base de datos | `postgres` | Usuario Supabase |
| `DB_PASSWORD` | Contraseña de base de datos | `postgres` | Contraseña URL-encoded de Supabase |
| `DB_DATABASE` | Nombre de la base de datos | `insurance_db` | `postgres` |
| `DB_SYNCHRONIZE` | Sincronización automática de esquemas TypeORM | `'true'` | `'true'` para auto-migración de tablas en arranque |
| `DB_SSL` | Habilitar conexión encriptada SSL | `'false'` | `'true'` (autodetectado si `DATABASE_URL` contiene Supabase) |
| `AUTO_SEED` | Ejecutar seeder de catálogos y plantillas en arranque | `'true'` | `'true'` (idempotente) |
| `JWT_SECRET` | Clave secreta para firma de tokens JWT | `evolution-secret-key-2026-very-secure` | Secreto seguro de producción |

### `golang-backend`
| Variable | Descripción | Valor por Defecto (Local / Docker) | Configuración en Producción (Cloud Run) |
| :--- | :--- | :--- | :--- |
| `PORT` | Puerto de escucha HTTP | `8080` | Inyectado automáticamente por Cloud Run (`8080`) |
| `JWT_SECRET` | Clave secreta compartida para validar tokens JWT | `evolution-secret-key-2026-very-secure` | Mismo secreto compartido que `node-backend` |

### `frontend` (Build Arguments)
| Argumento de Build | Descripción | Valor por Defecto (Local / Docker) | Valor en Producción (Cloud Run) |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | URL base del microservicio `node-backend` | `http://localhost:3000` | `https://insurance-node-backend-736264852423.us-central1.run.app` |
| `VITE_GO_API_URL` | URL base del microservicio `golang-backend` | `http://localhost:8080` | `https://insurance-golang-backend-736264852423.us-central1.run.app` |
