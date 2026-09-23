## 1. Project Scaffolding & Setup

- [x] 1.1 Initialize `node-backend/` project with TypeScript, tsconfig, ESLint, and `@hapi/hapi` dependencies
- [x] 1.2 Configure environment variables management and TypeORM data source for PostgreSQL
- [x] 1.3 Create base folder structure adhering to layer pattern (`routes`, `controllers`, `services`, `models`, `repositories`, `entities`, `mappers`, `publishers`)

## 2. Database Models & Seed Data

- [x] 2.1 Define TypeORM entities: `Product`, `EndorsementType`, `EndorsementTemplate`, `TemplateFieldConfig`, and `TemplateEventConfig`
- [x] 2.2 Create database migrations / synchronization scripts
- [x] 2.3 Create seed script inserting `Rumbo` + `CambioFrecuencia` dynamic template with 12 ordered fields and events

## 3. Core Business & Layered Logic

- [x] 3.1 Implement DTOs in `entities/` (`EndorseRequestDto`, `CoreResponseDto`, `TokenRequestDto`)
- [x] 3.2 Implement `TemplateRepository` with query method to fetch template with relations by product and endorsement type
- [x] 3.3 Implement `IEventPublisher` interface and `ConsoleEventPublisher` adapter logging structured JSON events
- [x] 3.4 Implement `EndorsementCoreMapper` with dynamic data sorting, default values injection, and required field validation
- [x] 3.5 Implement `EndorsementTranslatorService` orchestrating template lookup, mapping, validation, and domain event publishing

## 4. API Endpoints, Security & Controllers

- [x] 4.1 Configure `@hapi/jwt` authentication strategy and token generator helper route `POST /v1/auth/token`
- [x] 4.2 Implement `EndorseController` with Joi payload schema validation and HTTP status code mappings
- [x] 4.3 Register `/v1/endorse/translate` route with JWT authentication guard and controller binding
- [x] 4.4 Implement global Boom error handler plugin for consistent REST error responses

## 5. Testing & Verification

- [x] 5.1 Implement unit tests for `EndorsementCoreMapper` verifying exact 12-field ordering and default value fallbacks
- [x] 5.2 Implement unit tests for `EndorsementTranslatorService` with mocked repository and publisher
- [x] 5.3 Implement integration tests verifying endpoint response matches the exact JSON in the PDF specification
- [x] 5.4 Test negative scenarios: missing template (404), missing required field without default (400), unauthenticated request (401)

## 6. Dockerization & Orchestration

- [x] 6.1 Create multi-stage Dockerfile for `node-backend/`
- [x] 6.2 Add root `docker-compose.yml` to spin up PostgreSQL and `node-backend` service
- [x] 6.3 Document startup, seed, and curl testing instructions in `README.md`
