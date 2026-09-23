# Endorsement Translator Service (Node.js - Hapi)

Service built for the **Evolution (Endosos Sencillos)** initiative. It translates flat policy endorsement payloads sent by client applications into structured, strictly ordered, hierarchical JSON payloads required by the core insurance platform.

## Architecture

This project follows the strict layered architecture:

```
                            HTTP Request (POST /v1/endorse/translate)
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 1. ROUTES LAYER (@hapi/hapi routes, JWT auth guard, OpenAPI tags)                │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 2. CONTROLLER LAYER (EndorseController, AuthController)                          │
│    - Validates request payload against Joi schemas                               │
│    - Invokes Service layer and sets appropriate HTTP status codes (200, 400, 404)│
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 3. SERVICE LAYER (EndorsementTranslatorService)                                  │
│    - Fetches template configuration by (producto, tipoEndoso)                    │
│    - Delegates dynamic mapping and ordering to Mapper                            │
│    - Dispatches domain event to Publisher                                        │
└───────────────────────┬──────────────────────────────────┬───────────────────────┘
                        │                                  │
                        ▼                                  ▼
      ┌───────────────────────────────────┐    ┌───────────────────────────────────┐
      │ 4. REPOSITORY & MODEL (TypeORM)   │    │ 5. MAPPER LAYER                   │
      │    - TemplateRepository           │    │    - EndorsementCoreMapper        │
      │    - PostgreSQL Entities          │    │    - DynamicData & defaults engine│
      └───────────────────────────────────┘    └───────────────────────────────────┘
                                                           │
                                                           ▼
                                               ┌───────────────────────────────────┐
                                               │ 6. PUBLISHER LAYER                │
                                               │    - IEventPublisher interface    │
                                               │    - ConsoleEventPublisher        │
                                               └───────────────────────────────────┘
```

---

## Database Model for Dynamic Templates (PostgreSQL)

To satisfy the **extensibility requirement** (adding products/endorsements without code changes), templates are modeled relationally:

- `products`: Product catalog (e.g. `Rumbo`).
- `endorsement_types`: Endorsement catalog (e.g. `CambioFrecuencia`).
- `endorsement_templates`: Maps product + endorsement type, stores root event name and structural metadata.
- `template_field_configs`: Configures each item of `dynamicData` (`label`, `source_field`, `default_value`, `is_required`, and `display_order`).
- `template_event_configs`: Configures `eventAppliedEntities` (`event_description` and `order_event`).

---

## Quick Start with Docker Compose

To spin up both PostgreSQL and the `node-backend` service:

```bash
docker-compose up --build -d
```

Check health status:
```bash
curl http://localhost:3000/health
```

---

## Local Development (Without Docker)

### Prerequisites
- Node.js v20+
- Running PostgreSQL instance with database `insurance_db`

### 1. Install Dependencies
```bash
cd node-backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and adjust database credentials:
```bash
cp .env.example .env
```

### 3. Run Database Seeds
```bash
npm run seed
```

### 4. Run Automated Tests
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```

---

## API Usage & Verification

### 1. Generate JWT Access Token
```bash
curl -X POST http://localhost:3000/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "interface.servicios",
    "role": "service"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "username": "interface.servicios",
    "role": "service"
  }
}
```

### 2. Translate Endorsement Request
```bash
curl -X POST http://localhost:3000/v1/endorse/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
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

Response:
```json
{
  "policyNumber": "08200000049",
  "idEnvio": 5984,
  "financialPlansEntity": {
    "description": "Semestral"
  },
  "currency": {
    "description": "Nuevo Sol"
  },
  "productEntity": {
    "description": "Rumbo"
  },
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
        {
          "insuranceObjectNumber": "1",
          "coverageEntities": [],
          "participationEntities": []
        }
      ],
      "plansEntity": {
        "description": "PlanRumbo"
      },
      "riskUnitNumber": "1"
    }
  ],
  "participationEntities": []
}
```
