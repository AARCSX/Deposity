package expenses

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RegisterRoutes(rg *gin.RouterGroup, pool *pgxpool.Pool, authMiddleware gin.HandlerFunc) {
	repo := NewRepository(pool)
	service := NewService(repo)
	handler := NewHandler(service, pool)

	rg.Use(authMiddleware)
	{
		rg.GET("", handler.List)
		rg.POST("", handler.Create)
		rg.DELETE("/:id", handler.Delete)
		rg.GET("/emi-summary", handler.GetVehicleEMISummaries)
	}
}
