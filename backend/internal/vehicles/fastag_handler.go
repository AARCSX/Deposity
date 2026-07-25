package vehicles

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/Akshansh-29072005/Deposity/backend/internal/activity"
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

	fastagEntry, err := h.service.CreateFASTag(c.Request.Context(), tenantID, vehicleID, req)
	if err != nil {
		log.Printf("[CreateFASTag] ERROR: %v (req: %+v)", err, req)
		c.JSON(apperror.Resolve(err))
		return
	}

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "CREATE_FASTAG_LOG",
		Category:    "VEHICLES",
		EntityType:  "fastag_log",
		EntityID:    fastagEntry.ID,
		Description: fmt.Sprintf("%s logged FASTag toll expense (₹%.2f) at %s", middleware.GetUserName(c), req.Amount, req.TollPlaza),
		IPAddress:   c.ClientIP(),
	})

	c.JSON(http.StatusCreated, fastagEntry)
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

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "DELETE_FASTAG_LOG",
		Category:    "VEHICLES",
		EntityType:  "fastag_log",
		EntityID:    fastagID,
		Description: fmt.Sprintf("%s deleted FASTag toll entry", middleware.GetUserName(c)),
		IPAddress:   c.ClientIP(),
	})

	c.Status(http.StatusNoContent)
}
