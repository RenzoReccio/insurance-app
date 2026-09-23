package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/insurance/optimal-route-service/internal/middleware"
	"github.com/insurance/optimal-route-service/internal/model"
)

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) HandleGenerateToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	var req model.TokenRequest
	// Optional body parsing
	_ = json.NewDecoder(r.Body).Decode(&req)

	username := req.Username
	if username == "" {
		username = "operaciones.siniestros"
	}

	role := req.Role
	if role == "" {
		role = "service"
	}

	expiresIn := int64(86400) // 24 hours
	claims := jwt.MapClaims{
		"sub":      username,
		"username": username,
		"role":     role,
		"iat":      time.Now().Unix(),
		"exp":      time.Now().Unix() + expiresIn,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := middleware.GetJWTSecret()

	signedToken, err := token.SignedString(secret)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "Failed to sign JWT token: "+err.Error(), "SIGN_ERROR")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(model.TokenResponse{
		AccessToken: signedToken,
		TokenType:   "Bearer",
		ExpiresIn:   expiresIn,
	})
}
