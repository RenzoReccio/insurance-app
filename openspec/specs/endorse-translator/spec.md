# endorse-translator Specification

## Purpose
The Endorsement Translator service standardizes communication between client applications and the core insurance platform during policy endorsement procedures. It converts flat request payloads into structured, strictly ordered, hierarchical Core JSON payloads using database-driven dynamic templates.
## Requirements
### Requirement: Translate Flat Endorsement to Core Structured JSON
The system SHALL provide an authenticated HTTP endpoint `POST /v1/endorse/translate` that receives a flat endorsement payload and returns a fully structured, hierarchically nested Core JSON payload conforming to database template rules.

#### Scenario: Successful endorsement translation
- **WHEN** client sends a valid flat JSON payload for product `Rumbo` and endorsement type `CambioFrecuencia` with a valid JWT bearer token
- **THEN** system responds with HTTP 200 and a structured JSON payload containing `policyNumber`, `financialPlansEntity`, `currency`, `productEntity`, `eventEntity` with ordered `dynamicData`, `eventAppliedEntities`, and `riskUnitEntities`

### Requirement: Database-Driven Dynamic Field Ordering and Defaults
The system SHALL query PostgreSQL for the template associated with the `(producto, tipoEndoso)` tuple and assemble `dynamicData` in the strict order specified by `display_order`, applying default values for unprovided fields.

#### Scenario: Apply default values for omitted fields
- **WHEN** incoming flat payload does not contain `TipoEndosoPol`, `ResponsableAtencion`, or `EndosoModifPrima`
- **THEN** system populates `dynamicData` using the configured default values (`Endoso Simple`, `SAC`, `Si`) preserving their exact display order

#### Scenario: Override default with provided input value
- **WHEN** incoming flat payload supplies a non-empty value for a mapped field (e.g. `policyNumber: "08200000049"`)
- **THEN** system injects that value into `dynamicData` under the configured label (`NumeroPolizaEndoso`) at its defined display order

### Requirement: Strict Input Validation and Controlled Error Handling
The system SHALL validate incoming request payloads and enforce template requirements, returning descriptive errors when data is invalid or missing.

#### Scenario: Unknown product or endorsement type
- **WHEN** client sends an endorsement request with a `(producto, tipoEndoso)` pair not found in database templates
- **THEN** system returns HTTP 404 with an error code `TEMPLATE_NOT_FOUND` and a message identifying the missing combination

#### Scenario: Missing required template field without default
- **WHEN** incoming payload omits a field marked as `is_required = true` in the template and no `default_value` is defined
- **THEN** system returns HTTP 400 Bad Request listing the specific missing required field names

### Requirement: Asynchronous Domain Event Publishing
The system SHALL dispatch a domain event to the Publisher layer upon every successful translation.

#### Scenario: Emit translation event to console publisher
- **WHEN** an endorsement translation completes successfully
- **THEN** system invokes the `Publisher` layer emitting an `endorsement.translated` event with metadata and payload details to structured console logs

### Requirement: JWT Authentication and Security
The system SHALL secure the `/v1/endorse/translate` endpoint requiring a valid JWT Bearer token and provide a development token endpoint `POST /v1/auth/token`.

#### Scenario: Unauthorized request without token
- **WHEN** a client calls `POST /v1/endorse/translate` without a Authorization header or with an invalid token
- **THEN** system returns HTTP 401 Unauthorized

#### Scenario: Generate testing JWT token
- **WHEN** client calls `POST /v1/auth/token` with credentials
- **THEN** system returns HTTP 200 with a valid JWT token signed with the configured secret

