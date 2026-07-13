package dashboard

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegisterRoutes registers the Dashboard stats routes.
func RegisterRoutes(rg *gin.RouterGroup, pool *pgxpool.Pool, authMiddleware gin.HandlerFunc) {
	service := NewService(pool)
	handler := NewHandler(service)

	rg.Use(authMiddleware)
	{
		rg.GET("/stats", handler.GetStats)
	}
}