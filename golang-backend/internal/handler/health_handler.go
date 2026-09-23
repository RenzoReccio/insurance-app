package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/insurance/optimal-route-service/internal/model"
)

func HandleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(model.HealthResponse{
		Status:    "UP",
		Service:   "optimal-route-service",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}
