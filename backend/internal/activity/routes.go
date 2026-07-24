package activity

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegisterRoutes sets up the REST API endpoints for activity logs.
func RegisterRoutes(rg *gin.RouterGroup, db *pgxpool.Pool, authMiddleware gin.HandlerFunc) {
	handler := NewHandler(db)

	logsGroup := rg.Group("")
	logsGroup.Use(authMiddleware)
	{
		logsGroup.GET("", handler.GetActivityLogs)
		logsGroup.GET("/stats", handler.GetActivityStats)
	}
}
