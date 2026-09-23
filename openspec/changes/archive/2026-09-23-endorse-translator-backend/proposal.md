## Why

Client applications send policy endorsement data in a flat JSON format (e.g. `policyNumber`, `frecuencia`, `fechaSolicitud`), but the core insurance system requires an intricately structured and strictly-ordered JSON adhering to dynamic template rules (`dynamicData` order/labels, `eventAppliedEntities`, and default values). We need to create an extensible, strictly-layered Node.js (Hapi) translation service with PostgreSQL to standardize and automate this translation without requiring code changes when new products or endorsement types are introduced.

## What Changes

- Create a new autonomous Node.js service in `node-backend/` built with `@hapi/hapi` and TypeScript.
- Establish a PostgreSQL relational database with TypeORM to store products, endorsement types, templates, ordered dynamic data field configurations, and applied events.
- Implement the `/v1/endorse/translate` endpoint following a strict layered architecture: Routes -> Controller -> Service -> Mapper / Repository / Model / Entity (DTO) / Publisher.
- Implement dynamic mapping logic that validates required fields, injects defaults, and strictly enforces the defined ordering in `dynamicData` and `eventAppliedEntities`.
- Implement a decoupled `Publisher` layer (`ConsoleEventPublisher`) to emit asynchronous domain events (`endorsement.translated`) upon successful translation.
- Protect endpoints with `@hapi/jwt` bearer authentication and provide a token generation route for testing.
- Include automated unit tests for mapping and business logic, plus Dockerfile and PostgreSQL seed scripts for rapid local deployment.

## Capabilities

### New Capabilities
- `endorse-translator`: Translates flat insurance endorsement requests into structured, ordered Core JSON payloads based on database-driven dynamic templates.

### Modified Capabilities
<!-- None: Fresh project setup -->

## Impact

- **New Service**: `node-backend/` directory housing the Hapi application and TypeORM configurations.
- **Database**: PostgreSQL schema with tables `products`, `endorsement_types`, `endorsement_templates`, `template_field_configs`, and `template_event_configs`.
- **API Surface**: New endpoints `POST /v1/endorse/translate` (authenticated) and `POST /v1/auth/token` (token generation for test/dev).
- **Dependencies**: `@hapi/hapi`, `@hapi/jwt`, `@hapi/boom`, `joi`, `typeorm`, `pg`, `reflect-metadata`, `typescript`, `jest`, `ts-jest`.
