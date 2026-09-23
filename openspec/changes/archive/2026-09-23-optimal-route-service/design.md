## Context

The Evolution (Atención de Siniestros) initiative requires automating the dispatch of the closest tow truck (grúa) when a vehicular accident occurs in Lima. Currently, dispatch decisions are manual, causing operational delays.

This service is implemented in Golang (`golang-backend/`), accepting the accident location, an array of available depots, and an optional district graph to compute the minimal path.

## Goals / Non-Goals

**Goals:**
- Implement an autonomous Golang microservice in `golang-backend/` following standard Go project conventions.
- Implement an optimized Multi-Source Dijkstra algorithm using Go's `container/heap` min-heap.
- Provide clean separation: `algorithm` (pure graph logic), `service` (business rules), `handler` (HTTP REST), and `middleware` (JWT & recovery).
- Support dynamic graph inputs while providing a robust default Lima road network.
- Return controlled error status codes (400 for invalid inputs, 422 for unreachable destinations).
- Secure the API using JWT with the same shared secret as the Node.js backend.
- Provide comprehensive table-driven unit tests for the algorithm and HTTP integration tests.
- Dockerize with multi-stage scratch/alpine image and map port `8080` in `docker-compose.yml`.
- Update the frontend's "Rutas Óptimas" tab to consume this Go service.

**Non-Goals:**
- Real-time GPS vehicular telematics or live traffic congestion feeds.

## Decisions

### 1. Multi-Source Dijkstra vs Multiple Independent Dijkstra Runs
- **Decision**: Initialize the min-heap with all valid depots at distance `0` and origin set to each respective depot.
- **Rationale**: Eliminates redundant subgraph evaluations. Computes the globally minimal route from any depot to the accident location in a single $O(E + V \log V)$ pass. Terminating immediately upon popping the target node yields minimal latency.
- **Alternatives Considered**: Running Dijkstra $K$ times (rejected due to $O(K \times (E + V \log V))$ complexity).

### 2. Standard Go HTTP Stack (`net/http`)
- **Decision**: Use Go's standard library `net/http` with clean routing (Go 1.22+ enhanced ServeMux pattern) or lightweight `chi`.
- **Rationale**: Keeps binary footprint small (~15MB), zero unneeded dependencies, extremely high throughput, and memory efficiency.

### 3. Graph Structure Representation
- **Decision**: Adjacency map `type Graph map[string]map[string]float64`.
- **Rationale**: Direct $O(1)$ neighbor lookup and native JSON serialization matching the prompt's `{ "Node": { "Neighbor": weight } }` format.

### 4. Security & JWT Compatibility
- **Decision**: Use `github.com/golang-jwt/jwt/v5` validated against `JWT_SECRET`.
- **Rationale**: Full parity with `@hapi/jwt` in the Node.js service. The client can authenticate once and use the same bearer token across both microservices.

## Risks / Trade-offs

- **[Risk] Disconnected Graph Nodes (Unreachable Target)** →
  - *Mitigation*: If the priority queue empties without extracting the accident location, return a clean `422 Unprocessable Entity` with `UNREACHABLE_DESTINATION`.
- **[Risk] Negative Edge Weights** →
  - *Mitigation*: Graph validator rejects negative distance weights with `400 Bad Request` prior to running Dijkstra.
- **[Risk] Depot Exactly at Accident Location** →
  - *Mitigation*: Distance `0`, path `[Location]`, returned immediately in $O(1)$.
