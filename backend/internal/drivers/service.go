package drivers

import (
	"context"
	"database/sql"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetAll(ctx context.Context, tenantID string) ([]DriverResponse, error) {
	return s.repo.GetAll(ctx, tenantID)
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*DriverResponse, error) {
	d, err := s.repo.GetByID(ctx, tenantID, id)
	if err != nil {
		return nil, err
	}
	if d == nil {
		return nil, apperror.NotFound("driver not found")
	}
	return d, nil
}

func (s *Service) Create(ctx context.Context, tenantID string, req CreateDriverRequest) (*Driver, error) {
	status := "Active"
	if req.Status != "" {
		status = req.Status
	}

	var vehicleID sql.NullString
	if req.VehicleID != nil {
		vehicleID = sql.NullString{String: *req.VehicleID, Valid: true}
	}

	d := &Driver{
		TenantID:        tenantID,
		Name:            req.Name,
		Avatar:          req.Avatar,
		Status:          status,
		Phone:           req.Phone,
		VehicleID:       vehicleID,
		LicenseNumber:   req.LicenseNumber,
		LicenseExpiry:   req.LicenseExpiry,
		LicenseIssuance: req.LicenseIssuance,
		Salary:          req.Salary,
		PendingBalance:  req.PendingBalance,
		IsStatusWarning: req.IsStatusWarning,
	}

	if err := s.repo.Create(ctx, tenantID, d); err != nil {
		return nil, apperror.FromDBError(err)
	}

	return d, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, req UpdateDriverRequest) (*Driver, error) {
	d, err := s.repo.Update(ctx, tenantID, id, func(d *Driver) error {
		if req.Name != nil {
			d.Name = *req.Name
		}
		if req.Avatar != nil {
			d.Avatar = *req.Avatar
		}
		if req.Status != nil {
			d.Status = *req.Status
		}
		if req.Phone != nil {
			d.Phone = *req.Phone
		}
		if req.VehicleID != nil {
			if *req.VehicleID != nil {
				d.VehicleID = sql.NullString{String: **req.VehicleID, Valid: true}
			} else {
				d.VehicleID = sql.NullString{Valid: false}
			}
		}
		if req.LicenseNumber != nil {
			d.LicenseNumber = *req.LicenseNumber
		}
		if req.LicenseExpiry != nil {
			d.LicenseExpiry = *req.LicenseExpiry
		}
		if req.LicenseIssuance != nil {
			d.LicenseIssuance = req.LicenseIssuance
		}
		if req.Salary != nil {
			d.Salary = *req.Salary
		}
		if req.PendingBalance != nil {
			d.PendingBalance = *req.PendingBalance
		}
		if req.IsStatusWarning != nil {
			d.IsStatusWarning = *req.IsStatusWarning
		}
		return nil
	})

	if err != nil {
		return nil, apperror.FromDBError(err)
	}
	if d == nil {
		return nil, apperror.NotFound("driver not found")
	}

	return d, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	deleted, err := s.repo.Delete(ctx, tenantID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("driver not found")
	}
	return nil
}