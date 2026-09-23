## 1. Project Scaffolding & Design Foundation

- [x] 1.1 Initialize `frontend/` with Vite, React, TypeScript, and standard project structure
- [x] 1.2 Implement core CSS design system in `src/styles/index.css` (dark mode tokens, glassmorphism, glowing accents, Inter typography)
- [x] 1.3 Create common UI primitives (`Badge`, `Button`, `Card`, `Tabs`)

## 2. API Client & Authentication Layer

- [x] 2.1 Implement base API client in `src/api/client.ts` with error handling and Bearer token injection
- [x] 2.2 Implement authentication and translation API services in `src/api/endorse.api.ts`
- [x] 2.3 Implement auto-authentication hook `useAuth` to retrieve JWT from `/v1/auth/token` on mount

## 3. Input Components & Preset Scenarios

- [x] 3.1 Define preset payloads for Happy Path, Defaults Injection, Missing Field (400), and Unknown Template (404)
- [x] 3.2 Implement `PresetSelector` component for one-click scenario loading
- [x] 3.3 Implement `EndorseForm` visual form editor for easy field editing
- [x] 3.4 Implement `JsonEditor` raw JSON editor with syntax error validation and bi-directional synchronization

## 4. Output Inspectors & Dynamic Visualizers

- [x] 4.1 Implement `CodeViewer` with JSON syntax highlighting, collapsible nodes, and copy-to-clipboard
- [x] 4.2 Implement `DynamicDataTable` visualizer rendering the 12 fields strictly ordered with default badges
- [x] 4.3 Implement response status badge and execution latency indicator

## 5. View Assembly & Dashboard Integration

- [x] 5.1 Implement `Header` component with live API health indicator and JWT session status
- [x] 5.2 Assemble `EndorseTranslatorView` integrating presets, inputs, actions, and outputs
- [x] 5.3 Implement `OptimalRouteView` placeholder for Exercise 2 (Golang)
- [x] 5.4 Wire main navigation and tab switching in `App.tsx`

## 6. Dockerization & Compose Integration

- [x] 6.1 Create multi-stage Dockerfile with Nginx Alpine in `frontend/Dockerfile` and nginx configuration
- [x] 6.2 Update root `docker-compose.yml` to include `frontend` on port `5173`
- [x] 6.3 Verify production build with `npm run build`
