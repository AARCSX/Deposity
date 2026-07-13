package trips

import (
	"context"
	"database/sql"
	"time"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// GetAll returns all trips formatted for the frontend.
func (s *Service) GetAll(ctx context.Context, tenantID string) ([]TripResponse, error) {
	list, err := s.repo.GetAll(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	res := make([]TripResponse, len(list))
	for i, t := range list {
		res[i], err = s.MapToResponse(ctx, t)
		if err != nil {
			return nil, err
		}
	}
	return res, nil
}

// GetByID returns a single trip formatted for the frontend.
func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*TripResponse, error) {
	t, err := s.repo.GetByID(ctx, tenantID, id)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, apperror.NotFound("trip not found")
	}

	resp, err := s.MapToResponse(ctx, *t)
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

// Create resolves string IDs/names and inserts the trip.
func (s *Service) Create(ctx context.Context, tenantID string, req CreateTripRequest) (*TripResponse, error) {
	// Resolve Company ID from Company Name
	companyIDVal, err := s.repo.LookupCompanyID(ctx, tenantID, req.Cargo.Company)
	if err != nil {
		return nil, err
	}
	if companyIDVal == "" && req.Cargo.Company != "" {
		// Create a stub company so database reference is valid
		companyIDVal, err = s.repo.CreateStubCompany(ctx, tenantID, req.Cargo.Company)
		if err != nil {
			return nil, err
		}
	}

	// Resolve Vehicle ID from registration number
	vehicleIDVal, err := s.repo.LookupVehicleID(ctx, tenantID, req.Assignment.VehicleID)
	if err != nil {
		return nil, err
	}

	// Resolve Driver ID from name
	driverIDVal, err := s.repo.LookupDriverID(ctx, tenantID, req.Assignment.DriverID)
	if err != nil {
		return nil, err
	}

	status := "pending"
	if req.Status != "" {
		status = req.Status
	}

	t := &Trip{
		TenantID:        tenantID,
		Status:          status,
		OriginName:      req.Route.OriginName,
		OriginDate:      parseFlexibleDate(req.Route.OriginDate),
		DestinationName: req.Route.DestinationName,
		DestinationDate: parseFlexibleDate(req.Route.DestinationDate),
		IsEstimated:     req.Route.IsEstimated,
		Material:        req.Cargo.Material,
		Weight:          req.Cargo.Weight,
		CompanyID:       sql.NullString{String: companyIDVal, Valid: companyIDVal != ""},
		VehicleID:       sql.NullString{String: vehicleIDVal, Valid: vehicleIDVal != ""},
		DriverID:        sql.NullString{String: driverIDVal, Valid: driverIDVal != ""},
		TotalFreight:    req.Financials.TotalFreight,
		AdvancePaid:     req.Financials.AdvancePaid,
	}

	if err := s.repo.Create(ctx, tenantID, t); err != nil {
		return nil, err
	}

	resp, err := s.MapToResponse(ctx, *t)
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

// Update updates the trip, parsing optional fields.
func (s *Service) Update(ctx context.Context, tenantID, id string, req UpdateTripRequest) (*TripResponse, error) {
	t, err := s.repo.Update(ctx, tenantID, id, func(t *Trip) error {
		if req.Status != nil {
			t.Status = *req.Status
		}
		if req.Route != nil {
			t.OriginName = req.Route.OriginName
			t.OriginDate = parseFlexibleDate(req.Route.OriginDate)
			t.DestinationName = req.Route.DestinationName
			t.DestinationDate = parseFlexibleDate(req.Route.DestinationDate)
			t.IsEstimated = req.Route.IsEstimated
		}
		if req.Cargo != nil {
			t.Material = req.Cargo.Material
			t.Weight = req.Cargo.Weight
			if req.Cargo.Company != "" {
				companyIDVal, err := s.repo.LookupCompanyID(ctx, tenantID, req.Cargo.Company)
				if err == nil && companyIDVal != "" {
					t.CompanyID = sql.NullString{String: companyIDVal, Valid: true}
				} else if err == nil {
					companyIDVal, err = s.repo.CreateStubCompany(ctx, tenantID, req.Cargo.Company)
					if err == nil {
						t.CompanyID = sql.NullString{String: companyIDVal, Valid: true}
					}
				}
			}
		}
		if req.Assignment != nil {
			if req.Assignment.VehicleID != "" {
				vehicleIDVal, _ := s.repo.LookupVehicleID(ctx, tenantID, req.Assignment.VehicleID)
				t.VehicleID = sql.NullString{String: vehicleIDVal, Valid: vehicleIDVal != ""}
			}
			if req.Assignment.DriverID != "" {
				driverIDVal, _ := s.repo.LookupDriverID(ctx, tenantID, req.Assignment.DriverID)
				t.DriverID = sql.NullString{String: driverIDVal, Valid: driverIDVal != ""}
			}
		}
		if req.Financials != nil {
			t.TotalFreight = req.Financials.TotalFreight
			t.AdvancePaid = req.Financials.AdvancePaid
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, apperror.NotFound("trip not found")
	}

	resp, err := s.MapToResponse(ctx, *t)
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	deleted, err := s.repo.Delete(ctx, tenantID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("trip not found")
	}
	return nil
}

// MapToResponse translates the database Trip record back into the nested TripResponse.
func (s *Service) MapToResponse(ctx context.Context, t Trip) (TripResponse, error) {
	var companyName string
	if t.CompanyID.Valid {
		companyName, _ = s.repo.LookupCompanyName(ctx, t.CompanyID.String)
	}

	var vehicleRegNum string
	if t.VehicleID.Valid {
		vehicleRegNum, _ = s.repo.LookupVehicleRegNum(ctx, t.VehicleID.String)
	}

	var driverName string
	if t.DriverID.Valid {
		driverName, _ = s.repo.LookupDriverName(ctx, t.DriverID.String)
	}

	// Format dates for display
	originDateStr := t.OriginDate.Format("02 Jan 2006, 03:04 PM")
	destDateStr := t.DestinationDate.Format("02 Jan 2006")

	return TripResponse{
		ID:     t.ID,
		Status: t.Status,
		Route: RouteDetails{
			OriginName:      t.OriginName,
			OriginDate:      originDateStr,
			DestinationName: t.DestinationName,
			DestinationDate: destDateStr,
			IsEstimated:     t.IsEstimated,
		},
		Cargo: CargoDetails{
			Material: t.Material,
			Weight:   t.Weight,
			Company:  companyName,
		},
		Assignment: AssignmentDetails{
			VehicleID: vehicleRegNum,
			DriverID:  driverName,
		},
		Financials: FinancialsDetails{
			TotalFreight: t.TotalFreight,
			AdvancePaid:  t.AdvancePaid,
		},
	}, nil
}

// Helper to handle multiple dates input formats flexibly.
func parseFlexibleDate(dateStr string) time.Time {
	layouts := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02T15:04",
		"2006-01-02",
		"02 Jan 2006, 03:04 PM",
		"02 Jan 2006",
	}

	for _, l := range layouts {
		if t, err := time.Parse(l, dateStr); err == nil {
			return t
		}
	}
	return time.Now() // Fallback
}