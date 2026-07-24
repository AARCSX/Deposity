package settings

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Akshansh-29072005/Deposity/backend/internal/activity"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/middleware"
)

type Handler struct {
	service *Service
	db      *pgxpool.Pool
}

func NewHandler(service *Service, db *pgxpool.Pool) *Handler {
	return &Handler{service: service, db: db}
}

func (h *Handler) Get(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	authHeader := c.GetHeader("Authorization")
	defaultName := getOrgNameFromJWT(authHeader)
	userEmail := getUserEmailFromJWT(authHeader)
	userName := getUserNameFromJWT(authHeader)
	orgSlug := getOrgSlugFromJWT(authHeader)

	profile, err := h.service.GetOrCreateProfile(c.Request.Context(), tenantID, defaultName, userEmail, userName, orgSlug)
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

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "UPDATE_SETTINGS",
		Category:    "SETTINGS",
		EntityType:  "organization",
		EntityID:    tenantID,
		Description: "Updated organization profile & system preferences",
		IPAddress:   c.ClientIP(),
	})

	c.JSON(http.StatusOK, profile)
}

func (h *Handler) Delete(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if err := h.service.DeleteProfile(c.Request.Context(), tenantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "PURGE_TENANT_DATA",
		Category:    "SECURITY",
		EntityType:  "organization",
		EntityID:    tenantID,
		Description: "Permanently purged organization data and records",
		IPAddress:   c.ClientIP(),
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "All data for the organization has been permanently deleted."})
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

func getUserEmailFromJWT(authHeader string) string {
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}
	tokenString := parts[1]

	parser := jwt.NewParser()
	token, _, err := parser.ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return ""
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if email, ok := claims["email"].(string); ok {
			return email
		}
	}
	return ""
}

func getUserNameFromJWT(authHeader string) string {
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}
	tokenString := parts[1]

	parser := jwt.NewParser()
	token, _, err := parser.ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return ""
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if name, ok := claims["name"].(string); ok {
			return name
		}
	}
	return ""
}

func getOrgSlugFromJWT(authHeader string) string {
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}
	tokenString := parts[1]

	parser := jwt.NewParser()
	token, _, err := parser.ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return ""
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if orgSlug, ok := claims["org_slug"].(string); ok {
			return orgSlug
		}
	}
	return ""
}
