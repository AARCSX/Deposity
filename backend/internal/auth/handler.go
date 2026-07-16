package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/middleware"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// ExchangeCode handles the POST /auth/callback request from the frontend.
func (h *Handler) ExchangeCode(c *gin.Context) {
	var req ExchangeCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: code, code_verifier, and redirect_uri are required"})
		return
	}

	tokenResp, err := h.service.ExchangeCode(c.Request.Context(), req)
	if err != nil {
		// If it's our custom AppError, extract code and message. Otherwise, default to 500.
		type appErr interface {
			Error() string
		}
		// In a full implementation, we'd cast to *apperror.AppError. For simplicity, we just return the error string here.
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Successfully exchanged! Return tokens to frontend.
	c.JSON(http.StatusOK, tokenResp)
}

// Logout invalidates the active bearer token by adding its SHA-256 hash to the local blacklist.
func (h *Handler) Logout(c *gin.Context) {
	rawTokenVal, exists := c.Get("raw_token")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No active token found in context"})
		return
	}
	rawToken, _ := rawTokenVal.(string)

	claimsVal, exists := c.Get("token_claims")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No token claims found in context"})
		return
	}
	claims, _ := claimsVal.(jwt.MapClaims)

	// Calculate expiration from 'exp' claim
	var expiresAt time.Time
	if expVal, ok := claims["exp"].(float64); ok {
		expiresAt = time.Unix(int64(expVal), 0)
	} else {
		// If exp claim is missing or invalid, default blacklist to 15 minutes (our max accessTokenTtl)
		expiresAt = time.Now().Add(15 * time.Minute)
	}

	// Hash the raw token
	hasher := sha256.New()
	hasher.Write([]byte(rawToken))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	// Add to blacklist
	middleware.TokenBlacklist.Add(tokenHash, expiresAt)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Successfully logged out. Token has been blacklisted."})
}

// RefreshToken handles POST /auth/refresh to exchange a refresh_token for new tokens.
func (h *Handler) RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "refresh_token is required"})
		return
	}

	tokenResp, err := h.service.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to refresh token. Please login again."})
		return
	}

	c.JSON(http.StatusOK, tokenResp)
}