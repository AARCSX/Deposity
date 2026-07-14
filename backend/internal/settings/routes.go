package settings

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegisterRoutes registers the settings profile routes.
func RegisterRoutes(rg *gin.RouterGroup, pool *pgxpool.Pool, authMiddleware gin.HandlerFunc, brevoAPIKey, welcomeFrom string) {
	repo := NewRepository(pool)
	service := NewService(repo, brevoAPIKey, welcomeFrom)
	handler := NewHandler(service)

	rg.Use(authMiddleware)
	{
		rg.GET("", handler.Get)
		rg.PATCH("", handler.Update)
		rg.DELETE("", handler.Delete)
	}
}
