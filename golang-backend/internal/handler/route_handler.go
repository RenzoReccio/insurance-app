package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/insurance/optimal-route-service/internal/algorithm"
	"github.com/insurance/optimal-route-service/internal/model"
	"github.com/insurance/optimal-route-service/internal/service"
)

type RouteHandler struct {
	service service.IRouteService
}

func NewRouteHandler(s service.IRouteService) *RouteHandler {
	return &RouteHandler{service: s}
}

func (h *RouteHandler) HandleCalculateOptimalRoute(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	var req model.RouteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSONError(w, http.StatusBadRequest, "Invalid JSON payload: "+err.Error(), "BAD_REQUEST")
		return
	}

	resp, err := h.service.CalculateOptimalRoute(&req)
	if err != nil {
		switch {
		case errors.Is(err, algorithm.ErrLocationNotFound):
			writeJSONError(w, http.StatusBadRequest, err.Error(), "LOCATION_NOT_FOUND")
		case errors.Is(err, algorithm.ErrEmptyDepots):
			writeJSONError(w, http.StatusBadRequest, err.Error(), "EMPTY_DEPOTS")
		case errors.Is(err, algorithm.ErrDepotsNotInGraph):
			writeJSONError(w, http.StatusBadRequest, err.Error(), "DEPOTS_NOT_IN_GRAPH")
		case errors.Is(err, algorithm.ErrNegativeWeight):
			writeJSONError(w, http.StatusBadRequest, err.Error(), "NEGATIVE_WEIGHT")
		case errors.Is(err, algorithm.ErrUnreachableDestination):
			writeJSONError(w, http.StatusUnprocessableEntity, err.Error(), "UNREACHABLE_DESTINATION")
		default:
			writeJSONError(w, http.StatusInternalServerError, "Internal algorithm error: "+err.Error(), "INTERNAL_ERROR")
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

func writeJSONError(w http.ResponseWriter, statusCode int, message, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(model.ErrorResponse{
		StatusCode: statusCode,
		Error:      http.StatusText(statusCode),
		Message:    message,
		Code:       code,
	})
}
