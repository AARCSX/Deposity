package vehicles

import (
	"context"
	"fmt"
	"time"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/cache"
)

func (s *Service) CreateFuel(ctx context.Context, tenantID, vehicleID string, req CreateFuelRequest) (*FuelLog, error) {
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

	fuelType := "Diesel"
	if req.FuelType != "" {
		fuelType = req.FuelType
	}

	ppl := req.PricePerLitre
	if ppl == 0 && req.Litres > 0 {
		ppl = req.TotalPrice / req.Litres
	}

	log := &FuelLog{
		TenantID:      tenantID,
		VehicleID:     vehicleID,
		FuelType:      fuelType,
		Timestamp:     ts,
		Litres:        req.Litres,
		TotalPrice:    req.TotalPrice,
		PricePerLitre: ppl,
		StationName:   req.StationName,
	}

	if err := s.repo.CreateFuel(ctx, tenantID, vehicleID, log); err != nil {
		return nil, err
	}

	// Invalidate cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicle:%s", tenantID, vehicleID))
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicles:all", tenantID))

	return log, nil
}

func (s *Service) ListFuel(ctx context.Context, tenantID, vehicleID string) ([]*FuelLog, error) {
	return s.repo.ListFuel(ctx, tenantID, vehicleID)
}

func (s *Service) DeleteFuel(ctx context.Context, tenantID, vehicleID, id string) error {
	deleted, err := s.repo.DeleteFuel(ctx, tenantID, vehicleID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("fuel log entry not found")
	}

	// Invalidate cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicle:%s", tenantID, vehicleID))
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicles:all", tenantID))

	return nil
}
