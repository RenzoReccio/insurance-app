## ADDED Requirements

### Requirement: Calculate Optimal Route to Accident Location
The system SHALL provide an authenticated HTTP endpoint `POST /v1/routes/optimal` that calculates the shortest path and total distance from the nearest tow truck depot to the specified accident location.

#### Scenario: Successful route calculation with multiple depots
- **WHEN** client sends a request with accident location `"San Isidro"`, depots `["Miraflores", "Ate"]`, and the Lima district road graph
- **THEN** system responds with HTTP 200, identifies `"Miraflores"` as the nearest depot, returns path `["Miraflores", "San Isidro"]`, and total distance `7`

### Requirement: Efficient Multi-Source Dijkstra Algorithm Implementation
The system SHALL implement Dijkstra's algorithm using a min-heap priority queue initialized with all depots concurrently, resolving the shortest path in $O(E + V \log V)$ time without running independent searches per depot.

#### Scenario: Competing paths from multiple depots
- **WHEN** multiple depots have potential paths to the accident location
- **THEN** system selects the depot yielding the strictly minimum cumulative distance and reconstructs the sequential path of traversed nodes

### Requirement: Flexible Graph Extensibility
The system SHALL accept a dynamic graph of nodes (districts) and non-negative edge weights in the request payload, or fall back to the built-in default Lima road network when omitted.

#### Scenario: Dynamic graph override
- **WHEN** client provides a custom road graph with unique districts and distances
- **THEN** system calculates the optimal route using the provided network without requiring code changes

#### Scenario: Fallback to default Lima network
- **WHEN** client sends request with empty or omitted `graph`
- **THEN** system computes routes on the standard pre-configured Lima metropolitan district graph

### Requirement: Controlled Error Handling for Unreachable or Invalid Locations
The system SHALL validate inputs and return controlled HTTP error responses when destinations cannot be reached or inputs are malformed.

#### Scenario: Unreachable accident location
- **WHEN** accident location exists in a disconnected subgraph and cannot be reached from any provided depot
- **THEN** system returns HTTP 422 Unprocessable Entity with error code `UNREACHABLE_DESTINATION` and a descriptive message

#### Scenario: Unknown accident location or depot
- **WHEN** accident location is not present in the road network graph
- **THEN** system returns HTTP 400 Bad Request with error code `LOCATION_NOT_FOUND`

#### Scenario: Empty depots list
- **WHEN** client provides an empty `depots` array
- **THEN** system returns HTTP 400 Bad Request with error code `EMPTY_DEPOTS`

### Requirement: JWT Security and Service Authentication
The system SHALL secure the optimal route endpoint requiring a valid JWT Bearer token signed with the shared secret and provide a token generation endpoint `POST /v1/auth/token`.

#### Scenario: Unauthorized request without valid JWT
- **WHEN** client invokes `POST /v1/routes/optimal` without an Authorization header or with an invalid token
- **THEN** system returns HTTP 401 Unauthorized
