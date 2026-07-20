package vehicles

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/middleware"
)

func (h *Handler) ListFuel(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")

	list, err := h.service.ListFuel(c.Request.Context(), tenantID, vehicleID)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *Handler) CreateFuel(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")

	var req CreateFuelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fuelEntry, err := h.service.CreateFuel(c.Request.Context(), tenantID, vehicleID, req)
	if err != nil {
		log.Printf("[CreateFuel] ERROR: %v (req: %+v)", err, req)
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusCreated, fuelEntry)
}

func (h *Handler) DeleteFuel(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")
	fuelID := c.Param("fuelId")

	err := h.service.DeleteFuel(c.Request.Context(), tenantID, vehicleID, fuelID)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.Status(http.StatusNoContent)
}
