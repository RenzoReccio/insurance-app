## Context

The Evolution challenge requires a web frontend that consumes the translation service and dynamically displays the transformed Core JSON. The prompt also specifies that this frontend should be extensible to accommodate Exercise 2 (Optimal Route calculation).

This design establishes a modern Single Page Application (SPA) in `frontend/` communicating with `node-backend` on port `3000` and eventually `golang-backend` on port `8080`.

## Goals / Non-Goals

**Goals:**
- Create a fast, lightweight React + Vite + TypeScript application in `frontend/`.
- Provide an Executive Suite UI with dark mode, glassmorphic panels, glowing accents, and smooth transitions.
- Build an interactive Endorsement Translator studio with dual input modes (Form inputs and Raw JSON editor).
- Provide preconfigured test scenarios (Happy Path, Defaults Injection, Missing Field 400, Unknown Product 404).
- Automate JWT authentication by fetching tokens from `/v1/auth/token` on mount.
- Display structured outputs with formatted JSON viewer, one-click copy, and an ordered table for the 12 dynamic data fields.
- Scaffold multi-tab navigation to cleanly host Exercise 2.
- Provide a multi-stage Dockerfile using Nginx Alpine and update `docker-compose.yml`.

**Non-Goals:**
- Implementing the Golang backend route algorithm (Exercise 2 backend).
- Changing backend endpoints or database models.

## Decisions

### 1. Framework: React 18 with Vite & TypeScript
- **Rationale**: Minimal bundle size, lightning-fast HMR, excellent developer experience, and standard in modern enterprise web engineering.
- **Alternatives Considered**: Vue 3 (valid, but React was preferred during discovery).

### 2. Styling: Modern CSS System with CSS Tokens & Glassmorphism
- **Rationale**: Clean, modular CSS without heavy framework dependencies. Features dark theme surfaces (`#0B0F19`), glowing cyan/purple brand colors, subtle backdrop blurs (`backdrop-filter: blur(12px)`), and modern typography via `Inter`.

### 3. State Management: React Hooks & State Lifting
- **Rationale**: The state requirements (active tab, token, input payload, output JSON, loading/error states) are clean and localized. Local state with custom hooks provides optimal simplicity without Redux/Zustand overhead.

### 4. API Client & CORS Handling
- **Decision**: Native Fetch API client in `src/api/client.ts` configured with `VITE_API_URL` (defaulting to `http://localhost:3000`).
- **Token Injection**: Automatically attaches `Authorization: Bearer <token>` to all protected calls.

### 5. Deployment: Nginx Alpine Multi-stage Container
- **Decision**: Multi-stage build producing static assets served by unprivileged Nginx on port `80` (mapped to `5173` on host in docker-compose).

## Risks / Trade-offs

- **[Risk] CORS Issues between Frontend (5173) and Backend (3000)** →
  - *Mitigation*: The Hapi backend already has `cors: { origin: ['*'], credentials: true }` enabled in `server.ts`.
- **[Risk] JSON Parsing Errors in Raw Mode** → User enters invalid JSON text.
  - *Mitigation*: Client-side JSON linter parses text on change, displaying inline syntax error hints before triggering the API request.
