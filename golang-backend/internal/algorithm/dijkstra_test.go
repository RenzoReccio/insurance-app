package algorithm

import (
	"errors"
	"reflect"
	"testing"

	"github.com/insurance/optimal-route-service/internal/model"
)

func TestFindOptimalRoute_PDFExample(t *testing.T) {
	graph := model.DefaultLimaGraph()
	depots := []string{"Miraflores", "Ate"}
	accident := "San Isidro"

	resp, err := FindOptimalRoute(graph, depots, accident)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.FromDepot != "Miraflores" {
		t.Errorf("expected fromDepot 'Miraflores', got '%s'", resp.FromDepot)
	}

	if resp.To != "San Isidro" {
		t.Errorf("expected to 'San Isidro', got '%s'", resp.To)
	}

	if resp.Distance != 7 {
		t.Errorf("expected distance 7, got %f", resp.Distance)
	}

	expectedPath := []string{"Miraflores", "San Isidro"}
	if !reflect.DeepEqual(resp.Path, expectedPath) {
		t.Errorf("expected path %v, got %v", expectedPath, resp.Path)
	}
}

func TestFindOptimalRoute_CloserDepotSelection(t *testing.T) {
	// If accident is in Surco:
	// Ate -> Surco is distance 10
	// Miraflores -> Barranco (3) -> Surco (5) = distance 8
	// Miraflores should be chosen as closest!
	graph := model.DefaultLimaGraph()
	depots := []string{"Ate", "Miraflores"}
	accident := "Surco"

	resp, err := FindOptimalRoute(graph, depots, accident)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.FromDepot != "Miraflores" {
		t.Errorf("expected fromDepot 'Miraflores', got '%s'", resp.FromDepot)
	}

	if resp.Distance != 8 {
		t.Errorf("expected distance 8, got %f", resp.Distance)
	}

	expectedPath := []string{"Miraflores", "Barranco", "Surco"}
	if !reflect.DeepEqual(resp.Path, expectedPath) {
		t.Errorf("expected path %v, got %v", expectedPath, resp.Path)
	}
}

func TestFindOptimalRoute_AccidentAtDepot(t *testing.T) {
	graph := model.DefaultLimaGraph()
	depots := []string{"Miraflores", "Ate"}
	accident := "Miraflores"

	resp, err := FindOptimalRoute(graph, depots, accident)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.Distance != 0 {
		t.Errorf("expected distance 0, got %f", resp.Distance)
	}

	if !reflect.DeepEqual(resp.Path, []string{"Miraflores"}) {
		t.Errorf("expected path ['Miraflores'], got %v", resp.Path)
	}
}

func TestFindOptimalRoute_UnreachableDestination(t *testing.T) {
	graph := model.DefaultLimaGraph()
	// Add an isolated district "Chosica" with no incoming edges
	graph["Chosica"] = map[string]float64{}

	depots := []string{"Miraflores", "Ate"}
	accident := "Chosica"

	_, err := FindOptimalRoute(graph, depots, accident)
	if err == nil {
		t.Fatal("expected error for unreachable destination, got nil")
	}

	if !errors.Is(err, ErrUnreachableDestination) {
		t.Errorf("expected ErrUnreachableDestination, got %v", err)
	}
}

func TestFindOptimalRoute_MissingLocation(t *testing.T) {
	graph := model.DefaultLimaGraph()
	depots := []string{"Miraflores"}
	accident := "DistritoFantasma"

	_, err := FindOptimalRoute(graph, depots, accident)
	if err == nil {
		t.Fatal("expected error for missing location, got nil")
	}

	if !errors.Is(err, ErrLocationNotFound) {
		t.Errorf("expected ErrLocationNotFound, got %v", err)
	}
}

func TestFindOptimalRoute_EmptyDepots(t *testing.T) {
	graph := model.DefaultLimaGraph()
	depots := []string{}
	accident := "San Isidro"

	_, err := FindOptimalRoute(graph, depots, accident)
	if err == nil {
		t.Fatal("expected error for empty depots, got nil")
	}

	if !errors.Is(err, ErrEmptyDepots) {
		t.Errorf("expected ErrEmptyDepots, got %v", err)
	}
}

func TestFindOptimalRoute_NegativeWeight(t *testing.T) {
	graph := model.Graph{
		"A": {"B": -5},
		"B": {"A": 5},
	}
	depots := []string{"A"}
	accident := "B"

	_, err := FindOptimalRoute(graph, depots, accident)
	if err == nil {
		t.Fatal("expected error for negative weights, got nil")
	}

	if !errors.Is(err, ErrNegativeWeight) {
		t.Errorf("expected ErrNegativeWeight, got %v", err)
	}
}
