# Insurance Suite - Microservices & Platform

Plataforma integral de microservicios para la gestión aseguradora moderna, compuesta por un **Motor de Traducción de Endosos Dinámicos** (Node.js / Hapi / TypeORM), un **Servicio de Enrutamiento Óptimo de Grúas** (Golang / Multi-Source Dijkstra), un **Dashboard Ejecutivo Web** (React / TypeScript / Vite) y almacenamiento relacional en **PostgreSQL**.

---

## 🏛️ Arquitectura General del Sistema

El ecosistema está diseñado como una arquitectura de microservicios desacoplados, contenerizados y orquestados mediante Docker Compose:

```
                                 ┌─────────────────────────────────┐
                                 │   Frontend SPA (Vite / React)   │
                                 │      http://localhost:5173      │
                                 └───────────────┬─────────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        │ (HTTP REST / JSON / JWT Bearer)                 │
                        ▼                                                 ▼
       ┌─────────────────────────────────┐               ┌─────────────────────────────────┐
       │     node-backend (:3000)        │               │     golang-backend (:8080)      │
       │    Traductor de Endosos         │               │     Rutas Óptimas (Grúas)       │
       │  (Hapi.js + TypeORM + Joi)      │               │  (Go 1.23 + Dijkstra Heap)      │
       └────────────────┬────────────────┘               └─────────────────────────────────┘
                        │
                        ▼
       ┌─────────────────────────────────┐
       │       PostgreSQL (:5432)        │
       │   Plantillas y Catálogos        │
       └─────────────────────────────────┘
```

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

## 🚀 Inicio Rápido con Docker Compose

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
| Variable | Descripción | Valor por Defecto (Docker) |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha HTTP | `3000` |
| `DB_HOST` | Host de PostgreSQL | `postgres` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de base de datos | `postgres` |
| `DB_DATABASE` | Nombre de la base de datos | `insurance_db` |
| `JWT_SECRET` | Clave secreta para firma de tokens JWT | `evolution-secret-key-2026-very-secure` |

### `golang-backend`
| Variable | Descripción | Valor por Defecto (Docker) |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha HTTP | `8080` |
| `JWT_SECRET` | Clave secreta compartida para validar tokens JWT | `evolution-secret-key-2026-very-secure` |
