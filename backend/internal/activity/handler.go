package activity

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/middleware"
)

type Handler struct {
	db *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{db: db}
}

// GetActivityLogs handles GET /activity-logs
func (h *Handler) GetActivityLogs(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Missing tenant identity"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	filter := LogFilter{
		TenantID:  tenantID,
		Category:  c.Query("category"),
		UserID:    c.Query("user_id"),
		Action:    c.Query("action"),
		Search:    c.Query("search"),
		StartDate: c.Query("start_date"),
		EndDate:   c.Query("end_date"),
		Page:      page,
		Limit:     limit,
	}

	res, err := GetActivityLogs(c.Request.Context(), h.db, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activity logs: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

// GetActivityStats handles GET /activity-logs/stats
func (h *Handler) GetActivityStats(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Missing tenant identity"})
		return
	}

	stats, err := GetActivityStats(c.Request.Context(), h.db, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activity stats: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
