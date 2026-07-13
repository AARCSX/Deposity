package settings

import (
	"net/http"
	"strings"

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

func (h *Handler) Get(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	authHeader := c.GetHeader("Authorization")
	defaultName := getOrgNameFromJWT(authHeader)

	profile, err := h.service.GetOrCreateProfile(c.Request.Context(), tenantID, defaultName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, profile)
}

func (h *Handler) Update(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	var req UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile, err := h.service.UpdateProfile(c.Request.Context(), tenantID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, profile)
}

func getOrgNameFromJWT(authHeader string) string {
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "OnWay"
	}
	tokenString := parts[1]

	parser := jwt.NewParser()
	token, _, err := parser.ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return "OnWay"
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if orgName, ok := claims["org_name"].(string); ok && orgName != "" {
			return orgName
		}
	}
	return "OnWay"
}
