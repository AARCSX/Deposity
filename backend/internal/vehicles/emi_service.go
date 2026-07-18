package vehicles

import (
	"context"
	"fmt"
	"time"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/cache"
)

func (s *Service) CreateEMI(ctx context.Context, tenantID, vehicleID string, req CreateEMIRequest) (*EMISchedule, error) {
	dueDate, err := time.Parse(time.RFC3339, req.DueDate)
	if err != nil {
		// Fallback for simple date string (YYYY-MM-DD)
		dueDate, err = time.Parse("2006-01-02", req.DueDate)
		if err != nil {
			return nil, apperror.BadRequest("invalid due date format")
		}
	}

	var paymentDate *time.Time
	if req.PaymentDate != nil && *req.PaymentDate != "" {
		pDate, err := time.Parse(time.RFC3339, *req.PaymentDate)
		if err != nil {
			pDate, err = time.Parse("2006-01-02", *req.PaymentDate)
		}
		if err == nil {
			paymentDate = &pDate
		}
	}

	status := "Pending"
	if req.Status != "" {
		status = req.Status
	}

	emi := &EMISchedule{
		TenantID:      tenantID,
		VehicleID:     vehicleID,
		InstallmentNo: req.InstallmentNo,
		DueDate:       dueDate,
		Amount:        req.Amount,
		Status:        status,
		PaymentDate:   paymentDate,
		BankName:      req.BankName,
		ReferenceNo:   req.ReferenceNo,
	}

	if err := s.repo.CreateEMI(ctx, tenantID, vehicleID, emi); err != nil {
		return nil, err
	}

	// Invalidate vehicle cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicle:%s", tenantID, vehicleID))
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicles:all", tenantID))

	return emi, nil
}

func (s *Service) GetEMI(ctx context.Context, tenantID, vehicleID, id string) (*EMISchedule, error) {
	emi, err := s.repo.GetEMI(ctx, tenantID, vehicleID, id)
	if err != nil {
		return nil, err
	}
	if emi == nil {
		return nil, apperror.NotFound("emi schedule installment not found")
	}
	return emi, nil
}

func (s *Service) ListEMI(ctx context.Context, tenantID, vehicleID string) ([]*EMISchedule, error) {
	return s.repo.ListEMI(ctx, tenantID, vehicleID)
}

func (s *Service) UpdateEMI(ctx context.Context, tenantID, vehicleID, id string, req UpdateEMIRequest) (*EMISchedule, error) {
	emi, err := s.repo.GetEMI(ctx, tenantID, vehicleID, id)
	if err != nil {
		return nil, err
	}
	if emi == nil {
		return nil, apperror.NotFound("emi schedule installment not found")
	}

	if req.InstallmentNo != nil {
		emi.InstallmentNo = *req.InstallmentNo
	}
	if req.Amount != nil {
		emi.Amount = *req.Amount
	}
	if req.Status != nil {
		emi.Status = *req.Status
	}
	if req.BankName != nil {
		emi.BankName = *req.BankName
	}
	if req.ReferenceNo != nil {
		emi.ReferenceNo = *req.ReferenceNo
	}
	if req.DueDate != nil {
		dueDate, err := time.Parse(time.RFC3339, *req.DueDate)
		if err != nil {
			dueDate, err = time.Parse("2006-01-02", *req.DueDate)
		}
		if err != nil {
			return nil, apperror.BadRequest("invalid due date format")
		}
		emi.DueDate = dueDate
	}
	if req.PaymentDate != nil {
		if *req.PaymentDate == "" {
			emi.PaymentDate = nil
		} else {
			pDate, err := time.Parse(time.RFC3339, *req.PaymentDate)
			if err != nil {
				pDate, err = time.Parse("2006-01-02", *req.PaymentDate)
			}
			if err != nil {
				return nil, apperror.BadRequest("invalid payment date format")
			}
			emi.PaymentDate = &pDate
		}
	}

	if err := s.repo.UpdateEMI(ctx, tenantID, vehicleID, id, emi); err != nil {
		return nil, err
	}

	// Invalidate vehicle cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicle:%s", tenantID, vehicleID))
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicles:all", tenantID))

	return emi, nil
}

func (s *Service) DeleteEMI(ctx context.Context, tenantID, vehicleID, id string) error {
	deleted, err := s.repo.DeleteEMI(ctx, tenantID, vehicleID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("emi schedule installment not found")
	}

	// Invalidate vehicle cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicle:%s", tenantID, vehicleID))
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:vehicles:all", tenantID))

	return nil
}
