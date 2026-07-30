package employees

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

func (s *Service) GetAll(ctx context.Context, tenantID string) ([]EmployeeResponse, error) {
	var resp []EmployeeResponse
	cacheKey := fmt.Sprintf("tenant:%s:employees:all", tenantID)
	err := cache.Fetch(ctx, cacheKey, 5*time.Minute, &resp, func() (*[]EmployeeResponse, error) {
		list, err := s.repo.GetAll(ctx, tenantID)
		if err != nil {
			return nil, err
		}

		res := make([]EmployeeResponse, len(list))
		for i, e := range list {
			res[i] = MapToResponse(e)
		}
		return &res, nil
	})
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*EmployeeResponse, error) {
	var resp EmployeeResponse
	cacheKey := fmt.Sprintf("tenant:%s:employee:%s", tenantID, id)
	err := cache.Fetch(ctx, cacheKey, 5*time.Minute, &resp, func() (*EmployeeResponse, error) {
		e, err := s.repo.GetByID(ctx, tenantID, id)
		if err != nil {
			return nil, err
		}
		if e == nil {
			return nil, apperror.NotFound("employee not found")
		}

		r := MapToResponse(*e)
		return &r, nil
	})
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

func (s *Service) Create(ctx context.Context, tenantID string, req CreateEmployeeRequest) (*EmployeeResponse, error) {
	status := "Active"
	if req.Status != "" {
		status = req.Status
	}

	jDate := parseFlexibleDate(req.JoiningDate)

	e := &Employee{
		TenantID:       tenantID,
		Name:           req.Name,
		Role:           req.Role,
		Phone:          req.Phone,
		Email:          req.Email,
		JoiningDate:    jDate,
		BaseSalary:     req.BaseSalary,
		PendingBalance: req.PendingBalance,
		Status:         status,
		Avatar:         req.Avatar,
	}

	if err := s.repo.Create(ctx, tenantID, e); err != nil {
		return nil, err
	}

	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:employees:all", tenantID))

	resp := MapToResponse(*e)
	return &resp, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, req UpdateEmployeeRequest) (*EmployeeResponse, error) {
	e, err := s.repo.Update(ctx, tenantID, id, func(e *Employee) error {
		if req.Name != nil {
			e.Name = *req.Name
		}
		if req.Role != nil {
			e.Role = *req.Role
		}
		if req.Phone != nil {
			e.Phone = *req.Phone
		}
		if req.Email != nil {
			e.Email = *req.Email
		}
		if req.JoiningDate != nil {
			e.JoiningDate = parseFlexibleDate(*req.JoiningDate)
		}
		if req.BaseSalary != nil {
			e.BaseSalary = *req.BaseSalary
		}
		if req.PendingBalance != nil {
			e.PendingBalance = *req.PendingBalance
		}
		if req.Status != nil {
			e.Status = *req.Status
		}
		if req.Avatar != nil {
			e.Avatar = *req.Avatar
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, apperror.NotFound("employee not found")
	}

	cache.Invalidate(ctx,
		fmt.Sprintf("tenant:%s:employee:%s", tenantID, id),
		fmt.Sprintf("tenant:%s:employees:all", tenantID),
	)

	resp := MapToResponse(*e)
	return &resp, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	deleted, err := s.repo.Delete(ctx, tenantID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("employee not found")
	}

	cache.Invalidate(ctx,
		fmt.Sprintf("tenant:%s:employee:%s", tenantID, id),
		fmt.Sprintf("tenant:%s:employees:all", tenantID),
	)

	return nil
}

func (s *Service) GetSalaryHistory(ctx context.Context, tenantID, recipientType, recipientID string) ([]SalaryPaymentResponse, error) {
	payments, err := s.repo.GetSalaryHistory(ctx, tenantID, recipientType, recipientID)
	if err != nil {
		return nil, err
	}

	res := make([]SalaryPaymentResponse, len(payments))
	for i, p := range payments {
		res[i] = SalaryPaymentResponse{
			ID:             p.ID,
			RecipientType:  p.RecipientType,
			RecipientID:    p.RecipientID,
			AmountPaid:     p.AmountPaid,
			PendingBalance: p.PendingBalance,
			PaymentMode:    p.PaymentMode,
			Notes:          p.Notes,
			PaymentDate:    p.PaymentDate.Format("02 Jan 2006, 03:04 PM"),
		}
	}
	return res, nil
}

func MapToResponse(e Employee) EmployeeResponse {
	jDateStr := ""
	if !e.JoiningDate.IsZero() {
		jDateStr = e.JoiningDate.Format("2006-01-02")
	}

	return EmployeeResponse{
		ID:             e.ID,
		Name:           e.Name,
		Role:           e.Role,
		Phone:          e.Phone,
		Email:          e.Email,
		JoiningDate:    jDateStr,
		BaseSalary:     e.BaseSalary,
		PendingBalance: e.PendingBalance,
		Status:         e.Status,
		Avatar:         e.Avatar,
	}
}

func parseFlexibleDate(dateStr string) time.Time {
	if dateStr == "" {
		return time.Now()
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
