package vehicles

import (
	"context"
	"fmt"
	"time"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/cache"
)

func (s *Service) CreateFASTag(ctx context.Context, tenantID, vehicleID string, req CreateFASTagRequest) (*FASTagLog, error) {
	ts, err := time.Parse(time.RFC3339, req.Timestamp)
	if err != nil {
		ts, err = time.Parse(time.RFC3339Nano, req.Timestamp)
	}
	if err != nil {
		ts, err = time.Parse("2006-01-02T15:04:05", req.Timestamp)
	}
	if err != nil {
		ts, err = time.Parse("2006-01-02T15:04", req.Timestamp)
	}
	if err != nil {
		ts, err = time.Parse("2006-01-02", req.Timestamp)
	}
	if err != nil {
		return nil, apperror.BadRequest("invalid timestamp format")
	}

	status := "Debited"
	if req.Status != "" {
		status = req.Status
	}

	log := &FASTagLog{
		TenantID:      tenantID,
		VehicleID:     vehicleID,
		TransactionID: req.TransactionID,
		Timestamp:     ts,
		TollPlaza:     req.TollPlaza,
		Amount:        req.Amount,
		Status:        status,
		Balance:       req.Balance,
	}

	if err := s.repo.CreateFASTag(ctx, tenantID, vehicleID, log); err != nil {
		return nil, err
	}

	// Invalidate cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicle:%s", tenantID, vehicleID))
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicles:all", tenantID))

	return log, nil
}

func (s *Service) ListFASTag(ctx context.Context, tenantID, vehicleID string) ([]*FASTagLog, error) {
	return s.repo.ListFASTag(ctx, tenantID, vehicleID)
}

func (s *Service) DeleteFASTag(ctx context.Context, tenantID, vehicleID, id string) error {
	deleted, err := s.repo.DeleteFASTag(ctx, tenantID, vehicleID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("fastag log entry not found")
	}

	// Invalidate cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicle:%s", tenantID, vehicleID))
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicles:all", tenantID))

	return nil
}
