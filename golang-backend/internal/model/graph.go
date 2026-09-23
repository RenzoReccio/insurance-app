package model

// Graph represents a weighted adjacency map where Graph[source][destination] = distance.
type Graph map[string]map[string]float64

// DefaultLimaGraph returns the reference network of Lima districts specified in the technical assessment.
func DefaultLimaGraph() Graph {
	return Graph{
		"Miraflores": {
			"San Isidro": 7,
			"Barranco":   3,
		},
		"San Isidro": {
			"Miraflores": 7,
			"Lince":      4,
		},
		"Barranco": {
			"Miraflores": 3,
			"Surco":      5,
		},
		"Lince": {
			"San Isidro": 4,
			"Surco":      6,
		},
		"Surco": {
			"Barranco": 5,
			"Lince":    6,
			"Ate":      10,
		},
		"Ate": {
			"Surco": 10,
		},
	}
}

// Clone returns a deep copy of the graph.
func (g Graph) Clone() Graph {
	cp := make(Graph, len(g))
	for node, neighbors := range g {
		cp[node] = make(map[string]float64, len(neighbors))
		for neighbor, weight := range neighbors {
			cp[node][neighbor] = weight
		}
	}
	return cp
}

// HasNode checks if a given node exists in the graph.
func (g Graph) HasNode(node string) bool {
	_, exists := g[node]
	return exists
}
