package vehicles

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/middleware"
)

func (h *Handler) ListEMI(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")

	list, err := h.service.ListEMI(c.Request.Context(), tenantID, vehicleID)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *Handler) GetEMI(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")
	emiID := c.Param("emiId")

	emi, err := h.service.GetEMI(c.Request.Context(), tenantID, vehicleID, emiID)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusOK, emi)
}

func (h *Handler) CreateEMI(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")

	var req CreateEMIRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	emi, err := h.service.CreateEMI(c.Request.Context(), tenantID, vehicleID, req)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusCreated, emi)
}

func (h *Handler) UpdateEMI(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")
	emiID := c.Param("emiId")

	var req UpdateEMIRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	emi, err := h.service.UpdateEMI(c.Request.Context(), tenantID, vehicleID, emiID, req)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusOK, emi)
}

func (h *Handler) DeleteEMI(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")
	emiID := c.Param("emiId")

	err := h.service.DeleteEMI(c.Request.Context(), tenantID, vehicleID, emiID)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.Status(http.StatusNoContent)
}
