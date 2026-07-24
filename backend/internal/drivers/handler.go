package drivers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Akshansh-29072005/Deposity/backend/internal/activity"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/middleware"
)

type Handler struct {
	service *Service
	db      *pgxpool.Pool
}

func NewHandler(service *Service, db *pgxpool.Pool) *Handler {
	return &Handler{service: service, db: db}
}

func (h *Handler) List(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	list, err := h.service.GetAll(c.Request.Context(), tenantID)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *Handler) Get(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	id := c.Param("id")

	item, err := h.service.GetByID(c.Request.Context(), tenantID, id)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *Handler) Create(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	var req CreateDriverRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.service.Create(c.Request.Context(), tenantID, req)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "CREATE_DRIVER",
		Category:    "DRIVERS",
		EntityType:  "driver",
		EntityID:    item.ID,
		Description: fmt.Sprintf("%s added driver %s (License: %s)", middleware.GetUserName(c), item.Name, item.LicenseNumber),
		IPAddress:   c.ClientIP(),
	})

	c.JSON(http.StatusCreated, item)
}

func (h *Handler) Update(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	id := c.Param("id")

	var req UpdateDriverRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.service.Update(c.Request.Context(), tenantID, id, req)
	if err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "UPDATE_DRIVER",
		Category:    "DRIVERS",
		EntityType:  "driver",
		EntityID:    item.ID,
		Description: fmt.Sprintf("%s updated details for driver %s", middleware.GetUserName(c), item.Name),
		IPAddress:   c.ClientIP(),
	})

	c.JSON(http.StatusOK, item)
}

func (h *Handler) Delete(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	id := c.Param("id")

	if err := h.service.Delete(c.Request.Context(), tenantID, id); err != nil {
		c.JSON(apperror.Resolve(err))
		return
	}

	activity.LogActivity(h.db, activity.LogActivityParams{
		TenantID:    tenantID,
		UserID:      middleware.GetUserID(c),
		UserName:    middleware.GetUserName(c),
		UserRole:    middleware.GetUserRole(c),
		Action:      "DELETE_DRIVER",
		Category:    "DRIVERS",
		EntityType:  "driver",
		EntityID:    id,
		Description: fmt.Sprintf("%s deleted driver record #%s", middleware.GetUserName(c), id),
		IPAddress:   c.ClientIP(),
	})

	c.Status(http.StatusNoContent)
}