package vehicles

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RegisterRoutes registers the CRUD routes for Vehicles.
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

		// EMI Schedules
		rg.GET("/:id/emi", handler.ListEMI)
		rg.GET("/:id/emi/:emiId", handler.GetEMI)
		rg.POST("/:id/emi", handler.CreateEMI)
		rg.PUT("/:id/emi/:emiId", handler.UpdateEMI)
		rg.DELETE("/:id/emi/:emiId", handler.DeleteEMI)

		// FASTag logs
		rg.GET("/:id/fastag", handler.ListFASTag)
		rg.POST("/:id/fastag", handler.CreateFASTag)
		rg.DELETE("/:id/fastag/:fastagId", handler.DeleteFASTag)
	}
}