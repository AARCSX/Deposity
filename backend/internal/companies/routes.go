package companies

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegisterRoutes registers the CRUD routes for Companies.
func RegisterRoutes(rg *gin.RouterGroup, pool *pgxpool.Pool, authMiddleware gin.HandlerFunc) {
	repo := NewRepository(pool)
	service := NewService(repo)
	handler := NewHandler(service)

	rg.Use(authMiddleware)
	{
		rg.GET("", handler.List)
		rg.GET("/:id", handler.Get)
		rg.POST("", handler.Create)
		rg.PATCH("/:id", handler.Update)
		rg.PUT("/:id", handler.Update)
		rg.DELETE("/:id", handler.Delete)
	}
}