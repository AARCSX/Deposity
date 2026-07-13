package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
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