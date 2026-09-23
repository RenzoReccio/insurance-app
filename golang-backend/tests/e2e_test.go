package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/insurance/optimal-route-service/internal/handler"
	"github.com/insurance/optimal-route-service/internal/middleware"
	"github.com/insurance/optimal-route-service/internal/model"
	"github.com/insurance/optimal-route-service/internal/service"
)

func setupTestServer() http.Handler {
	routeSvc := service.NewRouteService()
	routeHdl := handler.NewRouteHandler(routeSvc)
	authHdl := handler.NewAuthHandler()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handler.HandleHealth)
	mux.HandleFunc("POST /v1/auth/token", authHdl.HandleGenerateToken)

	protectedRouteHandler := middleware.RequireJWT(routeHdl.HandleCalculateOptimalRoute)
	mux.HandleFunc("POST /v1/routes/optimal", protectedRouteHandler)
	mux.HandleFunc("POST /routes/optimal", protectedRouteHandler)

	return middleware.EnableCORS(mux)
}

func TestE2E_Health(t *testing.T) {
	ts := httptest.NewServer(setupTestServer())
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/health")
	if err != nil {
		t.Fatalf("failed to call /health: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200 OK, got %d", resp.StatusCode)
	}

	var health model.HealthResponse
	if err := json.NewDecoder(resp.Body).Decode(&health); err != nil {
		t.Fatalf("failed to decode health response: %v", err)
	}

	if health.Status != "UP" {
		t.Errorf("expected status 'UP', got '%s'", health.Status)
	}
}

func TestE2E_TokenAndOptimalRoute(t *testing.T) {
	ts := httptest.NewServer(setupTestServer())
	defer ts.Close()

	// 1. Generate Token
	tokenReq := model.TokenRequest{Username: "test.agent", Role: "service"}
	tokenBody, _ := json.Marshal(tokenReq)

	tokenResp, err := http.Post(ts.URL+"/v1/auth/token", "application/json", bytes.NewBuffer(tokenBody))
	if err != nil {
		t.Fatalf("failed to request token: %v", err)
	}
	defer tokenResp.Body.Close()

	if tokenResp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 for token, got %d", tokenResp.StatusCode)
	}

	var tokenData model.TokenResponse
	_ = json.NewDecoder(tokenResp.Body).Decode(&tokenData)
	if tokenData.AccessToken == "" {
		t.Fatal("empty access token received")
	}

	// 2. Reject without Token (401)
	routeReq := model.RouteRequest{
		AccidentLocation: "San Isidro",
		Depots:           []string{"Miraflores", "Ate"},
		Graph:            model.DefaultLimaGraph(),
	}
	routeBody, _ := json.Marshal(routeReq)

	unauthResp, err := http.Post(ts.URL+"/v1/routes/optimal", "application/json", bytes.NewBuffer(routeBody))
	if err != nil {
		t.Fatalf("failed to call without auth: %v", err)
	}
	unauthResp.Body.Close()
	if unauthResp.StatusCode != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized without token, got %d", unauthResp.StatusCode)
	}

	// 3. Success with Token (200 OK)
	client := &http.Client{}
	req, _ := http.NewRequest("POST", ts.URL+"/v1/routes/optimal", bytes.NewBuffer(routeBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+tokenData.AccessToken)

	authResp, err := client.Do(req)
	if err != nil {
		t.Fatalf("failed to call with auth: %v", err)
	}
	defer authResp.Body.Close()

	if authResp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", authResp.StatusCode)
	}

	var routeResult model.RouteResponse
	_ = json.NewDecoder(authResp.Body).Decode(&routeResult)

	if routeResult.FromDepot != "Miraflores" {
		t.Errorf("expected fromDepot 'Miraflores', got '%s'", routeResult.FromDepot)
	}
	if routeResult.To != "San Isidro" {
		t.Errorf("expected to 'San Isidro', got '%s'", routeResult.To)
	}
	if routeResult.Distance != 7 {
		t.Errorf("expected distance 7, got %f", routeResult.Distance)
	}
	if len(routeResult.Path) != 2 || routeResult.Path[0] != "Miraflores" || routeResult.Path[1] != "San Isidro" {
		t.Errorf("expected path ['Miraflores', 'San Isidro'], got %v", routeResult.Path)
	}

	// 4. Test Unreachable destination returns 422
	unreachableReq := model.RouteRequest{
		AccidentLocation: "Ancon",
		Depots:           []string{"Miraflores"},
		Graph: model.Graph{
			"Miraflores": {"San Isidro": 5},
			"San Isidro": {"Miraflores": 5},
			"Ancon":      {}, // Isolated node
		},
	}
	unreachableBody, _ := json.Marshal(unreachableReq)
	req2, _ := http.NewRequest("POST", ts.URL+"/v1/routes/optimal", bytes.NewBuffer(unreachableBody))
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("Authorization", "Bearer "+tokenData.AccessToken)

	unreachableResp, err := client.Do(req2)
	if err != nil {
		t.Fatalf("failed to request unreachable route: %v", err)
	}
	defer unreachableResp.Body.Close()

	if unreachableResp.StatusCode != http.StatusUnprocessableEntity {
		t.Errorf("expected 422 Unprocessable Entity, got %d", unreachableResp.StatusCode)
	}
}
