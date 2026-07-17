package maintenance

import (
	"context"
	"fmt"
	"time"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/cache"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetAll(ctx context.Context, tenantID string) ([]MaintenanceResponse, error) {
	var resp []MaintenanceResponse
	cacheKey := fmt.Sprintf("tenant:%s:maintenance:all", tenantID)
	err := cache.Fetch(ctx, cacheKey, 5*time.Minute, &resp, func() (*[]MaintenanceResponse, error) {
		list, err := s.repo.GetAll(ctx, tenantID)
		if err != nil {
			return nil, err
		}

		res := make([]MaintenanceResponse, len(list))
		for i, m := range list {
			res[i] = MapToResponse(m)
		}
		return &res, nil
	})
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*MaintenanceResponse, error) {
	var resp MaintenanceResponse
	cacheKey := fmt.Sprintf("tenant:%s:maintenance:%s", tenantID, id)
	err := cache.Fetch(ctx, cacheKey, 5*time.Minute, &resp, func() (*MaintenanceResponse, error) {
		m, err := s.repo.GetByID(ctx, tenantID, id)
		if err != nil {
			return nil, err
		}
		if m == nil {
			return nil, apperror.NotFound("maintenance record not found")
		}

		r := MapToResponse(*m)
		return &r, nil
	})
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

func (s *Service) Create(ctx context.Context, tenantID string, req CreateMaintenanceRequest) (*MaintenanceResponse, error) {
	status := "Completed"
	if req.Status != "" {
		status = req.Status
	}
	if status != "Pending" && status != "Scheduled" && status != "Completed" {
		return nil, apperror.BadRequest("invalid maintenance status: must be Pending, Scheduled, or Completed")
	}

	m := &Maintenance{
		TenantID:            tenantID,
		VehicleID:           req.VehicleID,
		VehicleNumber:       req.VehicleNumber,
		MaintenanceType:     req.MaintenanceType,
		MaintenanceDate:     parseFlexibleDate(req.MaintenanceDate),
		OdometerReading:     req.OdometerReading,
		ServiceCenter:       req.ServiceCenter,
		Mechanic:            req.Mechanic,
		Cost:                req.Cost,
		Description:         req.Description,
		PartsReplaced:       req.PartsReplaced,
		NextServiceDate:     parseFlexibleDate(req.NextServiceDate),
		NextServiceOdometer: req.NextServiceOdometer,
		Status:              status,
		Notes:               req.Notes,
		TyreID:              req.TyreID,
	}

	if err := s.repo.Create(ctx, tenantID, m); err != nil {
		return nil, err
	}

	// Invalidate maintenance list cache.
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:maintenance:all", tenantID))

	resp := MapToResponse(*m)
	return &resp, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, req UpdateMaintenanceRequest) (*MaintenanceResponse, error) {
	m, err := s.repo.Update(ctx, tenantID, id, func(m *Maintenance) error {
		if req.VehicleID != nil {
			m.VehicleID = *req.VehicleID
		}
		if req.VehicleNumber != nil {
			m.VehicleNumber = *req.VehicleNumber
		}
		if req.MaintenanceType != nil {
			m.MaintenanceType = *req.MaintenanceType
		}
		if req.MaintenanceDate != nil {
			m.MaintenanceDate = parseFlexibleDate(*req.MaintenanceDate)
		}
		if req.OdometerReading != nil {
			m.OdometerReading = *req.OdometerReading
		}
		if req.ServiceCenter != nil {
			m.ServiceCenter = *req.ServiceCenter
		}
		if req.Mechanic != nil {
			m.Mechanic = *req.Mechanic
		}
		if req.Cost != nil {
			m.Cost = *req.Cost
		}
		if req.Description != nil {
			m.Description = *req.Description
		}
		if req.PartsReplaced != nil {
			m.PartsReplaced = *req.PartsReplaced
		}
		if req.NextServiceDate != nil {
			m.NextServiceDate = parseFlexibleDate(*req.NextServiceDate)
		}
		if req.NextServiceOdometer != nil {
			m.NextServiceOdometer = *req.NextServiceOdometer
		}
		if req.Status != nil {
			nextStatus := *req.Status
			if nextStatus != "Pending" && nextStatus != "Scheduled" && nextStatus != "Completed" {
				return apperror.BadRequest("invalid maintenance status: must be Pending, Scheduled, or Completed")
			}
			if !validateStatusTransition(m.Status, nextStatus) {
				return apperror.BadRequest("invalid status transition from " + m.Status + " to " + nextStatus)
			}
			m.Status = nextStatus
		}
		if req.Notes != nil {
			m.Notes = *req.Notes
		}
		if req.TyreID != nil {
			m.TyreID = *req.TyreID
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	if m == nil {
		return nil, apperror.NotFound("maintenance record not found")
	}

	// Invalidate maintenance cache and maintenance list cache.
	cache.Invalidate(ctx, 
		fmt.Sprintf("tenant:%s:maintenance:%s", tenantID, id),
		fmt.Sprintf("tenant:%s:maintenance:all", tenantID),
	)

	resp := MapToResponse(*m)
	return &resp, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	deleted, err := s.repo.Delete(ctx, tenantID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("maintenance record not found")
	}

	// Invalidate maintenance cache and maintenance list cache.
	cache.Invalidate(ctx, 
		fmt.Sprintf("tenant:%s:maintenance:%s", tenantID, id),
		fmt.Sprintf("tenant:%s:maintenance:all", tenantID),
	)

	return nil
}

// MapToResponse converts database Maintenance struct to nested MaintenanceResponse DTO.
func MapToResponse(m Maintenance) MaintenanceResponse {
	nextServiceDateStr := ""
	if !m.NextServiceDate.IsZero() {
		nextServiceDateStr = m.NextServiceDate.Format("2006-01-02")
	}

	return MaintenanceResponse{
		ID:                  m.ID,
		VehicleID:           m.VehicleID,
		VehicleNumber:       m.VehicleNumber,
		MaintenanceType:     m.MaintenanceType,
		MaintenanceDate:     m.MaintenanceDate.Format("2006-01-02"),
		OdometerReading:     m.OdometerReading,
		ServiceCenter:       m.ServiceCenter,
		Mechanic:            m.Mechanic,
		Cost:                m.Cost,
		Description:         m.Description,
		PartsReplaced:       m.PartsReplaced,
		NextServiceDate:     nextServiceDateStr,
		NextServiceOdometer: m.NextServiceOdometer,
		Status:              m.Status,
		Notes:               m.Notes,
		TyreID:              m.TyreID,
	}
}

func parseFlexibleDate(dateStr string) time.Time {
	if dateStr == "" {
		return time.Time{}
	}
	layouts := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02T15:04",
		"2006-01-02",
		"02 Jan 2006",
	}

	for _, l := range layouts {
		if t, err := time.Parse(l, dateStr); err == nil {
			return t
		}
	}
	return time.Now()
}

func validateStatusTransition(current, next string) bool {
	switch current {
	case "Pending":
		return next == "Pending" || next == "Scheduled" || next == "Completed"
	case "Scheduled":
		return next == "Scheduled" || next == "Completed"
	case "Completed":
		return next == "Completed"
	default:
		return next == "Pending" || next == "Scheduled" || next == "Completed"
	}
}