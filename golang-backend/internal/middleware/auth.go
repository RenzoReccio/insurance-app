package middleware

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/insurance/optimal-route-service/internal/model"
)

// GetJWTSecret returns the configured JWT secret key.
func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "evolution-secret-key-2026-very-secure"
	}
	return []byte(secret)
}

// RequireJWT enforces JWT authentication on HTTP endpoints.
func RequireJWT(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeError(w, http.StatusUnauthorized, "Missing Authorization header with Bearer token", "UNAUTHORIZED")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			writeError(w, http.StatusUnauthorized, "Invalid Authorization header format. Expected 'Bearer <token>'", "UNAUTHORIZED")
			return
		}

		tokenStr := parts[1]
		secret := GetJWTSecret()

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return secret, nil
		})

		if err != nil || !token.Valid {
			writeError(w, http.StatusUnauthorized, "Invalid or expired JWT token", "UNAUTHORIZED")
			return
		}

		next(w, r)
	}
}

func writeError(w http.ResponseWriter, statusCode int, message, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(model.ErrorResponse{
		StatusCode: statusCode,
		Error:      http.StatusText(statusCode),
		Message:    message,
		Code:       code,
	})
}
