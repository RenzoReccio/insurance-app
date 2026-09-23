package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/insurance/optimal-route-service/internal/handler"
	"github.com/insurance/optimal-route-service/internal/middleware"
	"github.com/insurance/optimal-route-service/internal/service"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize layers
	routeSvc := service.NewRouteService()
	routeHdl := handler.NewRouteHandler(routeSvc)
	authHdl := handler.NewAuthHandler()

	mux := http.NewServeMux()

	// Health endpoint
	mux.HandleFunc("GET /health", handler.HandleHealth)

	// Auth token generation endpoint
	mux.HandleFunc("POST /v1/auth/token", authHdl.HandleGenerateToken)

	// Optimal route computation endpoints (protected with JWT)
	protectedRouteHandler := middleware.RequireJWT(routeHdl.HandleCalculateOptimalRoute)
	mux.HandleFunc("POST /v1/routes/optimal", protectedRouteHandler)
	mux.HandleFunc("POST /routes/optimal", protectedRouteHandler) // Prompt alias

	// Global Middleware: CORS
	handlerWithCORS := middleware.EnableCORS(mux)

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handlerWithCORS,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Server run context
	serverErrors := make(chan error, 1)
	go func() {
		log.Printf("[Server] Optimal Route Service running on http://0.0.0.0:%s", port)
		serverErrors <- server.ListenAndServe()
	}()

	// Graceful shutdown
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		log.Fatalf("[Server] Error starting server: %v", err)

	case sig := <-shutdown:
		log.Printf("[Server] Shutdown signal received: %v", sig)
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("[Server] Graceful shutdown failed: %v", err)
			_ = server.Close()
		}
		fmt.Println("[Server] Server stopped cleanly")
	}
}
