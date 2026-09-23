## Why

When vehicular accidents occur in Lima, currently assigns tow trucks (grúas) manually, causing delays, suboptimal routing, and customer dissatisfaction. We need an automated, high-performance microservice in Golang that models the Lima district road network and calculates the optimal route from the closest depot using Dijkstra's algorithm.

## What Changes

- Create a new autonomous Golang microservice in `golang-backend/` following standard Go project layout.
- Implement an efficient Multi-Source Dijkstra algorithm using Go's `container/heap` priority queue to find the closest depot and reconstruct the shortest path in $O(E + V \log V)$.
- Support flexible graph structures allowing dynamic graphs in request payloads or falling back to a pre-configured Lima metropolitan road network.
- Implement controlled error responses (e.g. `422 Unreachable Destination`, `400 Invalid Location/Empty Depots`).
- Protect the API with JWT Bearer authentication matching the shared secret and provide `/v1/auth/token` for testing.
- Implement unit tests covering Dijkstra algorithm edge cases (unreachable nodes, single depot, identical distances).
- Provide a multi-stage Dockerfile and wire `golang-backend` into `docker-compose.yml` on port `8080`.
- Connect the frontend's "Rutas Óptimas" tab to consume this Go endpoint.

## Non-goals

- Real-time GPS vehicular telematics or traffic congestion API streaming.
- Modifying the existing Node.js translator backend service or PostgreSQL database schema.

## Capabilities

### New Capabilities
- `optimal-route`: Multi-depot shortest path calculation service for vehicle tow truck dispatch across district road networks.

### Modified Capabilities
<!-- None: Fresh capability addition -->

## Impact

- **New Service**: `golang-backend/` with Go 1.23 standard layout and minimal Docker scratch/alpine image.
- **Orchestration**: `docker-compose.yml` updated with `golang-backend` on port `8080`.
- **API Surface**: New endpoints `POST /v1/routes/optimal`, `POST /v1/auth/token`, and `GET /health`.
- **Frontend**: Connects `OptimalRouteView` in `frontend/` to the Go backend.
