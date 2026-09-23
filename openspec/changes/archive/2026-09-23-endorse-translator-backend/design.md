## Context

The Evolution (Endosos Sencillos) initiative requires standardizing how policy endorsements are received and processed. Client applications send flat, unnested JSON payloads, whereas the core insurance platform requires a complex, strictly ordered, hierarchical JSON. The core structure varies by insurance product and endorsement type.

This service acts as a specialized translator microservice residing in `node-backend/`, operating between client applications and the core platform.

## Goals / Non-Goals

**Goals:**
- Implement an autonomous Node.js service using `@hapi/hapi` and TypeScript in `node-backend/`.
- Model and implement a PostgreSQL database using TypeORM supporting dynamic templates, ordered dynamic data, and default values.
- Adhere strictly to the prescribed layered architecture: `routes`, `controllers`, `services`, `repositories`, `models`, `entities` (DTOs), `mappers`, `publishers`, and `tests`.
- Implement dynamic mapping with strict array order preservation and field validation.
- Implement an event-driven `Publisher` port with a structured `ConsoleEventPublisher` adapter.
- Provide token-based security via `@hapi/jwt` and a dev token generator.
- Provide comprehensive unit tests for business logic, mapping, and error handling.
- Provide Dockerfile and docker-compose configurations for PostgreSQL and the service.

**Non-Goals:**
- Exercise 2 (Golang Optimal Route Service) - handled in a separate change proposal for `golang-backend/`.
- Frontend application (React/Vue) - handled in a dedicated frontend change proposal.
- Real Kafka/RabbitMQ broker infrastructure - handled via clean `IEventPublisher` abstraction logging to console in this phase.

## Decisions

### 1. Framework: `@hapi/hapi` with TypeScript
- **Rationale**: Specifically requested in assessment. Hapi provides robust lifecycle extension points, plugin architecture, first-class Joi validation, and enterprise-grade request lifecycle handling.
- **Alternatives Considered**: Express/NestJS (rejected due to direct prompt requirement for Hapi).

### 2. Database & ORM: PostgreSQL with TypeORM
- **Rationale**: Relational integrity for catalogs and template configurations, full TypeORM entity support as recommended in the challenge rubric.
- **Schema Design (Option C: Hybrid Relational + Declarative Template)**:
  - `products`: Catalog of insurance products (e.g. `Rumbo`).
  - `endorsement_types`: Catalog of endorsement actions (e.g. `CambioFrecuencia`).
  - `endorsement_templates`: Maps product + endorsement type, stores root event name and structural metadata.
  - `template_field_configs`: Controls each item of `dynamicData` with `label`, `source_field`, `default_value`, `is_required`, and `display_order`.
  - `template_event_configs`: Controls `eventAppliedEntities` with `event_description` and `order_event`.

### 3. Layered Architecture Separation
- `routes/`: Hapi route definitions, HTTP method, path, and auth strategies.
- `controllers/`: Request parsing, Joi schema validation, invoking services, returning HTTP responses.
- `services/`: Business workflow (lookup template, invoke mapper, trigger publisher).
- `mappers/`: Pure, deterministic conversion of flat DTO + template entity into Core JSON.
- `publishers/`: `IEventPublisher` interface with `ConsoleEventPublisher` writing structured JSON logs.
- `repositories/` & `models/`: TypeORM entities and data access layer.

### 4. Publisher Implementation Strategy
- **Decision**: Define `IEventPublisher` interface and provide `ConsoleEventPublisher` for this phase.
- **Rationale**: Avoids hard coupling to broker infrastructure (Kafka, RabbitMQ) in local development while maintaining clean separation of concerns and strict adherence to the architecture diagram.

### 5. Security & Versioning
- **Decision**: Prefix route with `/v1/endorse/translate` and guard with `@hapi/jwt`.
- **Testing Aid**: Provide `/v1/auth/token` endpoint to issue signed tokens for local curl/postman testing.

## Risks / Trade-offs

- **[Risk] Strict Array Ordering in Core JSON** → In JavaScript, array order is preserved, but object keys are technically non-guaranteed in older specs.
  - *Mitigation*: `dynamicData` is an array of objects (`[{ etiqueta, value }, ...]`). We use explicit numeric sorting (`display_order ASC`) from PostgreSQL before pushing to the output array.
- **[Risk] Missing Template on Edge Products** → Client sends an unconfigured product or endorsement type.
  - *Mitigation*: Service throws a controlled domain exception that translates to `HTTP 404 Template Not Found` with actionable error details.
- **[Risk] TypeORM Startup Latency in Docker** → App attempts to connect before PostgreSQL container is healthy.
  - *Mitigation*: Docker-compose uses healthchecks and restart policies; TypeORM connection retry logic with backoff is implemented during server bootstrap.
