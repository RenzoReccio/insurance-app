package service

import (
	"strings"

	"github.com/insurance/optimal-route-service/internal/algorithm"
	"github.com/insurance/optimal-route-service/internal/model"
)

// IRouteService defines the business operations for calculating routes.
type IRouteService interface {
	CalculateOptimalRoute(req *model.RouteRequest) (*model.RouteResponse, error)
}

type routeService struct{}

// NewRouteService creates a new instance of IRouteService.
func NewRouteService() IRouteService {
	return &routeService{}
}

func (s *routeService) CalculateOptimalRoute(req *model.RouteRequest) (*model.RouteResponse, error) {
	// Clean and normalize strings
	accidentLocation := strings.TrimSpace(req.AccidentLocation)
	var cleanDepots []string
	for _, d := range req.Depots {
		trimmed := strings.TrimSpace(d)
		if trimmed != "" {
			cleanDepots = append(cleanDepots, trimmed)
		}
	}

	// Determine graph to use: if request provides graph, use it; otherwise fallback to default
	var activeGraph model.Graph
	if len(req.Graph) > 0 {
		activeGraph = req.Graph
	} else {
		activeGraph = model.DefaultLimaGraph()
	}

	return algorithm.FindOptimalRoute(activeGraph, cleanDepots, accidentLocation)
}
