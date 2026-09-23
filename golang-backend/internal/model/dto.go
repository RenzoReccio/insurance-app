package model

// RouteRequest represents the incoming JSON request payload.
type RouteRequest struct {
	AccidentLocation string   `json:"accidentLocation"`
	Depots           []string `json:"depots"`
	Graph            Graph    `json:"graph,omitempty"`
}

// RouteResponse represents the computed optimal route response.
type RouteResponse struct {
	FromDepot string   `json:"fromDepot"`
	To        string   `json:"to"`
	Path      []string `json:"path"`
	Distance  float64  `json:"distance"`
}

// ErrorResponse represents a standardized JSON error envelope.
type ErrorResponse struct {
	StatusCode int    `json:"statusCode"`
	Error      string `json:"error"`
	Message    string `json:"message"`
	Code       string `json:"code,omitempty"`
}

// TokenRequest represents payload for issuing testing JWT.
type TokenRequest struct {
	Username string `json:"username"`
	Role     string `json:"role"`
}

// TokenResponse represents JWT generation output.
type TokenResponse struct {
	AccessToken string `json:"accessToken"`
	TokenType   string `json:"tokenType"`
	ExpiresIn   int64  `json:"expiresIn"`
}

// HealthResponse represents service health status.
type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
}
