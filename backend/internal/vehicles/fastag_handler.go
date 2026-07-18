package vehicles

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/middleware"
)

func (h *Handler) ListFASTag(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")

	list, err := h.service.ListFASTag(c.Request.Context(), tenantID, vehicleID)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *Handler) CreateFASTag(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")

	var req CreateFASTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log, err := h.service.CreateFASTag(c.Request.Context(), tenantID, vehicleID, req)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusCreated, log)
}

func (h *Handler) DeleteFASTag(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Param("id")
	fastagID := c.Param("fastagId")

	err := h.service.DeleteFASTag(c.Request.Context(), tenantID, vehicleID, fastagID)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.Status(http.StatusNoContent)
}
