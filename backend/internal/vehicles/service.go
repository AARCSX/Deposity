package vehicles

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

func (s *Service) GetAll(ctx context.Context, tenantID string) ([]VehicleResponse, error) {
	list, err := s.repo.GetAll(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	res := make([]VehicleResponse, len(list))
	for i, v := range list {
		res[i] = MapToResponse(v)
	}
	return res, nil
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*VehicleResponse, error) {
	v, err := s.repo.GetByID(ctx, tenantID, id)
	if err != nil {
		return nil, err
	}
	if v == nil {
		return nil, apperror.NotFound("vehicle not found")
	}
	
	resp := MapToResponse(*v)
	return &resp, nil
}

func (s *Service) Create(ctx context.Context, tenantID string, req CreateVehicleRequest) (*VehicleResponse, error) {
	var driverID sql.NullString
	if req.Ownership.DriverID != nil {
		driverID = sql.NullString{String: *req.Ownership.DriverID, Valid: true}
	}

	status := "all-good"
	if req.Status != "" {
		status = req.Status
	}

	v := &Vehicle{
		TenantID:           tenantID,
		RegistrationNumber: req.Core.RegistrationNumber,
		Make:               req.Core.Make,
		Model:              req.Core.Model,
		Year:               req.Core.Year,
		BodyType:           req.Core.BodyType,
		AxleConfig:         req.Core.AxleConfig,
		TonnageCapacity:    req.Core.TonnageCapacity,
		FuelCapacity:       req.Core.FuelCapacity,
		AverageMileage:     req.Core.AverageMileage,
		RCExpiry:           req.Compliance.RCExpiry,
		RCIssuance:         req.Compliance.RCIssuance,
		InsuranceExpiry:    req.Compliance.InsuranceExpiry,
		InsuranceIssuance:  req.Compliance.InsuranceIssuance,
		PUCExpiry:          req.Compliance.PUCExpiry,
		PUCIssuance:        req.Compliance.PUCIssuance,
		FitnessExpiry:      req.Compliance.FitnessExpiry,
		FitnessIssuance:    req.Compliance.FitnessIssuance,
		PermitDetails:      req.Compliance.PermitDetails,
		OwnershipType:      req.Ownership.OwnershipType,
		DriverID:           driverID,
		HomeBranch:         req.Ownership.HomeBranch,
		GPSDeviceID:        req.Ownership.GPSDeviceID,
		CurrentOdometer:    req.Maintenance.CurrentOdometer,
		LastServicedDate:   req.Maintenance.LastServicedDate,
		Status:             status,
	}

	if err := s.repo.Create(ctx, tenantID, v); err != nil {
		return nil, apperror.FromDBError(err)
	}

	resp := MapToResponse(*v)
	return &resp, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, req UpdateVehicleRequest) (*VehicleResponse, error) {
	v, err := s.repo.Update(ctx, tenantID, id, func(v *Vehicle) error {
		if req.Core != nil {
			v.RegistrationNumber = req.Core.RegistrationNumber
			v.Make = req.Core.Make
			v.Model = req.Core.Model
			v.Year = req.Core.Year
			v.BodyType = req.Core.BodyType
			v.AxleConfig = req.Core.AxleConfig
			v.TonnageCapacity = req.Core.TonnageCapacity
			v.FuelCapacity = req.Core.FuelCapacity
			v.AverageMileage = req.Core.AverageMileage
		}
		if req.Compliance != nil {
			v.RCExpiry = req.Compliance.RCExpiry
			v.RCIssuance = req.Compliance.RCIssuance
			v.InsuranceExpiry = req.Compliance.InsuranceExpiry
			v.InsuranceIssuance = req.Compliance.InsuranceIssuance
			v.PUCExpiry = req.Compliance.PUCExpiry
			v.PUCIssuance = req.Compliance.PUCIssuance
			v.FitnessExpiry = req.Compliance.FitnessExpiry
			v.FitnessIssuance = req.Compliance.FitnessIssuance
			v.PermitDetails = req.Compliance.PermitDetails
		}
		if req.Ownership != nil {
			v.OwnershipType = req.Ownership.OwnershipType
			v.HomeBranch = req.Ownership.HomeBranch
			v.GPSDeviceID = req.Ownership.GPSDeviceID
			
			if req.Ownership.DriverID != nil {
				v.DriverID = sql.NullString{String: *req.Ownership.DriverID, Valid: true}
			} else {
				v.DriverID = sql.NullString{Valid: false}
			}
		}
		if req.Maintenance != nil {
			v.CurrentOdometer = req.Maintenance.CurrentOdometer
			v.LastServicedDate = req.Maintenance.LastServicedDate
		}
		if req.Status != nil {
			v.Status = *req.Status
		}
		return nil
	})

	if err != nil {
		return nil, apperror.FromDBError(err)
	}
	if v == nil {
		return nil, apperror.NotFound("vehicle not found")
	}

	resp := MapToResponse(*v)
	return &resp, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	deleted, err := s.repo.Delete(ctx, tenantID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("vehicle not found")
	}
	return nil
}

// MapToResponse converts the database flat Vehicle struct to nested VehicleResponse DTO.
func MapToResponse(v Vehicle) VehicleResponse {
	var driverID string
	if v.DriverID.Valid {
		driverID = v.DriverID.String
	}

	return VehicleResponse{
		ID: v.ID,
		Core: CoreSpecifications{
			RegistrationNumber: v.RegistrationNumber,
			Make:               v.Make,
			Model:              v.Model,
			Year:               v.Year,
			BodyType:           v.BodyType,
			AxleConfig:         v.AxleConfig,
			TonnageCapacity:    v.TonnageCapacity,
			FuelCapacity:       v.FuelCapacity,
			AverageMileage:     v.AverageMileage,
		},
		Compliance: ComplianceDocuments{
			RCExpiry:          v.RCExpiry,
			RCIssuance:        v.RCIssuance,
			InsuranceExpiry:   v.InsuranceExpiry,
			InsuranceIssuance: v.InsuranceIssuance,
			PUCExpiry:         v.PUCExpiry,
			PUCIssuance:       v.PUCIssuance,
			FitnessExpiry:     v.FitnessExpiry,
			FitnessIssuance:   v.FitnessIssuance,
			PermitDetails:     v.PermitDetails,
		},
		Ownership: OwnershipStatus{
			OwnershipType: v.OwnershipType,
			DriverID:      &driverID,
			HomeBranch:    v.HomeBranch,
			GPSDeviceID:   v.GPSDeviceID,
		},
		Maintenance: MaintenanceData{
			CurrentOdometer:  v.CurrentOdometer,
			LastServicedDate: v.LastServicedDate,
		},
		Status: v.Status,
	}
}