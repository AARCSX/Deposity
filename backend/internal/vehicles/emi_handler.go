package vehicles

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/Akshansh-29072005/Deposity/backend/internal/activity"
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

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "CREATE_EMI_SCHEDULE",
		Category:    "VEHICLES",
		EntityType:  "emi_schedule",
		EntityID:    emi.ID,
		Description: fmt.Sprintf("%s logged EMI schedule (₹%.2f/mo) for vehicle", middleware.GetUserName(c), req.Amount),
		IPAddress:   c.ClientIP(),
	})

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

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "UPDATE_EMI_SCHEDULE",
		Category:    "VEHICLES",
		EntityType:  "emi_schedule",
		EntityID:    emi.ID,
		Description: fmt.Sprintf("%s updated EMI payment status to %s", middleware.GetUserName(c), req.Status),
		IPAddress:   c.ClientIP(),
	})

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

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "DELETE_EMI_SCHEDULE",
		Category:    "VEHICLES",
		EntityType:  "emi_schedule",
		EntityID:    emiID,
		Description: fmt.Sprintf("%s deleted EMI schedule", middleware.GetUserName(c)),
		IPAddress:   c.ClientIP(),
	})

	c.Status(http.StatusNoContent)
}
