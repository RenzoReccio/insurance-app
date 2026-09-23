## Why

Users and evaluators need an intuitive, responsive web application to dynamically test and visualize the endorsement translation process (Exercise 1), as well as a foundation to host the upcoming tow truck optimal route calculation (Exercise 2). This frontend provides dual input modes (form controls and raw JSON), preset test cases, automated authentication, and real-time visualization of the resulting Core structured JSON.

## What Changes

- Initialize a modern React + Vite + TypeScript application in `frontend/`.
- Implement an Executive Suite UI with dark mode, glassmorphism, and responsive layout.
- Build a dual-tab navigation housing **Endorsement Translator** (active) and **Optimal Route Dispatcher** (prepared placeholder for Exercise 2).
- Create dual input mechanisms: an interactive form and an editable JSON editor.
- Provide 4 instant test presets: Happy Path (Rumbo), Defaults Injection, Missing Required Field (400), and Unregistered Template (404).
- Implement an automated JWT token manager communicating with `/v1/auth/token`.
- Build output inspectors: formatted JSON with one-click copy and an ordered `dynamicData` table.
- Provide a multi-stage Dockerfile and wire the frontend into `docker-compose.yml` on port `5173`.

## Non-goals

- Implementing the Golang backend algorithm for optimal routes (reserved for `golang-backend`).
- Modifying the existing Node.js Hapi backend service or database schema.

## Capabilities

### New Capabilities
- `endorse-translator-ui`: Interactive user interface to configure, authenticate, transmit, and inspect endorsement translations.

### Modified Capabilities
<!-- None: Backend capability endorse-translator remains unchanged -->

## Impact

- **New Application**: `frontend/` directory with Vite, React 18/19, TypeScript, and Nginx Dockerfile.
- **Orchestration**: `docker-compose.yml` updated to include the frontend service.
- **APIs Consumed**: `POST /v1/auth/token`, `POST /v1/endorse/translate`, and `GET /health`.
