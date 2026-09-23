package algorithm

import (
	"container/heap"
	"errors"
	"fmt"

	"github.com/insurance/optimal-route-service/internal/model"
)

var (
	ErrLocationNotFound       = errors.New("LOCATION_NOT_FOUND")
	ErrEmptyDepots            = errors.New("EMPTY_DEPOTS")
	ErrDepotsNotInGraph       = errors.New("DEPOTS_NOT_IN_GRAPH")
	ErrUnreachableDestination = errors.New("UNREACHABLE_DESTINATION")
	ErrNegativeWeight         = errors.New("NEGATIVE_WEIGHT_NOT_ALLOWED")
)

// FindOptimalRoute calculates the shortest path from the nearest depot to the accident location
// using an optimized Multi-Source Dijkstra algorithm with a min-heap priority queue.
func FindOptimalRoute(g model.Graph, depots []string, accidentLocation string) (*model.RouteResponse, error) {
	if len(depots) == 0 {
		return nil, ErrEmptyDepots
	}

	if !g.HasNode(accidentLocation) {
		return nil, fmt.Errorf("%w: accident location '%s' does not exist in graph", ErrLocationNotFound, accidentLocation)
	}

	// Validate weights in the graph
	for node, neighbors := range g {
		for neighbor, weight := range neighbors {
			if weight < 0 {
				return nil, fmt.Errorf("%w: edge (%s -> %s) has negative weight %f", ErrNegativeWeight, node, neighbor, weight)
			}
		}
	}

	// Filter valid depots that exist in the network
	var validDepots []string
	for _, depot := range depots {
		if g.HasNode(depot) {
			validDepots = append(validDepots, depot)
		}
	}

	if len(validDepots) == 0 {
		return nil, fmt.Errorf("%w: none of the provided depots exist in the road network", ErrDepotsNotInGraph)
	}

	// Check if accident location is itself a depot
	for _, depot := range validDepots {
		if depot == accidentLocation {
			return &model.RouteResponse{
				FromDepot: depot,
				To:        accidentLocation,
				Path:      []string{accidentLocation},
				Distance:  0,
			}, nil
		}
	}

	// Multi-Source Dijkstra setup
	dist := make(map[string]float64)
	prev := make(map[string]string)
	origin := make(map[string]string)
	visited := make(map[string]bool)

	pq := make(PriorityQueue, 0)
	heap.Init(&pq)

	// Initialize all depots concurrently at distance 0
	for _, depot := range validDepots {
		dist[depot] = 0
		origin[depot] = depot
		heap.Push(&pq, &Item{
			Node:        depot,
			Distance:    0,
			OriginDepot: depot,
		})
	}

	var targetFound bool
	var finalDepot string
	var finalDistance float64

	for pq.Len() > 0 {
		curr := heap.Pop(&pq).(*Item)

		if visited[curr.Node] {
			continue
		}
		visited[curr.Node] = true

		// Early exit: First time target is popped from heap, shortest path is guaranteed
		if curr.Node == accidentLocation {
			targetFound = true
			finalDepot = curr.OriginDepot
			finalDistance = curr.Distance
			break
		}

		for neighbor, weight := range g[curr.Node] {
			newDist := curr.Distance + weight
			oldDist, exists := dist[neighbor]

			if !exists || newDist < oldDist {
				dist[neighbor] = newDist
				prev[neighbor] = curr.Node
				origin[neighbor] = curr.OriginDepot
				heap.Push(&pq, &Item{
					Node:        neighbor,
					Distance:    newDist,
					OriginDepot: curr.OriginDepot,
				})
			}
		}
	}

	if !targetFound {
		return nil, fmt.Errorf("%w: accident location '%s' is unreachable from any provided depot", ErrUnreachableDestination, accidentLocation)
	}

	// Reconstruct path
	path := reconstructPath(prev, accidentLocation, finalDepot)

	return &model.RouteResponse{
		FromDepot: finalDepot,
		To:        accidentLocation,
		Path:      path,
		Distance:  finalDistance,
	}, nil
}

func reconstructPath(prev map[string]string, target, start string) []string {
	var reversePath []string
	curr := target

	for curr != "" {
		reversePath = append(reversePath, curr)
		if curr == start {
			break
		}
		curr = prev[curr]
	}

	// Reverse into sequential order [start, ..., target]
	path := make([]string, len(reversePath))
	for i, j := 0, len(reversePath)-1; j >= 0; i, j = i+1, j-1 {
		path[i] = reversePath[j]
	}

	return path
}
