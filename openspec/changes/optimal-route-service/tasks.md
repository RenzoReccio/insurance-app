## 1. Project Setup & Data Structures

- [x] 1.1 Initialize `golang-backend/` with `go.mod` (Go 1.23) and standard directory structure
- [x] 1.2 Define domain models and DTOs in `internal/model/` (`Graph`, `RouteRequest`, `RouteResponse`, `ErrorResponse`)
- [x] 1.3 Implement default Lima metropolitan road network dataset

## 2. Multi-Source Dijkstra Algorithm

- [x] 2.1 Implement min-heap priority queue using standard `container/heap` in `internal/algorithm/priority_queue.go`
- [x] 2.2 Implement multi-source Dijkstra algorithm with concurrent depot initialization and path reconstruction in `internal/algorithm/dijkstra.go`
- [x] 2.3 Implement graph validation utilities (detect negative weights, verify node existence)

## 3. Algorithm Unit Testing

- [x] 3.1 Write table-driven unit tests for Dijkstra matching the PDF example (`Miraflores` to `San Isidro` = 7)
- [x] 3.2 Write unit tests for edge cases: unreachable destination, single depot, tie-breaking, accident at depot

## 4. Service, Security & HTTP Layer

- [x] 4.1 Implement `RouteService` in `internal/service/` coordinating validation, default network fallback, and algorithm execution
- [x] 4.2 Implement JWT authentication middleware in `internal/middleware/auth.go` using shared `JWT_SECRET`
- [x] 4.3 Implement HTTP handlers for `POST /v1/routes/optimal`, `POST /v1/auth/token`, and `GET /health` in `internal/handler/`
- [x] 4.4 Implement `cmd/server/main.go` bootstrap with CORS and graceful shutdown

## 5. Integration Testing

- [x] 5.1 Implement HTTP integration tests using `net/http/httptest` verifying 200, 400, 401, and 422 responses
- [x] 5.2 Validate cross-compatibility of JWT tokens between Node backend and Go backend

## 6. Dockerization & Frontend Integration

- [x] 6.1 Create multi-stage Dockerfile producing minimal alpine image for `golang-backend/`
- [x] 6.2 Update root `docker-compose.yml` adding `golang-backend` on port `8080`
- [x] 6.3 Connect `OptimalRouteView` in `frontend/` to the Go backend API and test in browser
