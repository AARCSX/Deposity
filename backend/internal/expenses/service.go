package expenses

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

func (s *Service) GetAll(ctx context.Context, tenantID string) ([]ExpenseResponse, error) {
	var resp []ExpenseResponse
	cacheKey := fmt.Sprintf("tenant:%s:expenses:all", tenantID)
	err := cache.Fetch(ctx, cacheKey, 3*time.Minute, &resp, func() (*[]ExpenseResponse, error) {
		list, err := s.repo.GetAll(ctx, tenantID)
		if err != nil {
			return nil, err
		}

		res := make([]ExpenseResponse, len(list))
		for i, e := range list {
			res[i] = s.MapToResponse(ctx, e)
		}
		return &res, nil
	})
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (s *Service) Create(ctx context.Context, tenantID string, req CreateExpenseRequest) (*ExpenseResponse, error) {
	expDate := parseFlexibleDate(req.ExpenseDate)

	title := req.Title
	if title == "" {
		if req.Category == "Salary" {
			title = fmt.Sprintf("Salary Disbursement for %s", req.RecipientType)
		} else if req.Category == "EMI" {
			title = "Vehicle EMI Installment Payment"
		} else {
			title = fmt.Sprintf("%s Expense", req.Category)
		}
	}

	e := &Expense{
		TenantID:      tenantID,
		Category:      req.Category,
		Title:         title,
		Amount:        req.Amount,
		ExpenseDate:   expDate,
		RecipientType: req.RecipientType,
		RecipientID:   req.RecipientID,
		VehicleID:     req.VehicleID,
		PaymentMode:   req.PaymentMode,
		Notes:         req.Notes,
	}

	if err := s.repo.Create(ctx, tenantID, e, req.PendingBalance, req.InstallmentNo); err != nil {
		return nil, err
	}

	// Invalidate caches
	cache.Invalidate(ctx,
		fmt.Sprintf("tenant:%s:expenses:all", tenantID),
		fmt.Sprintf("tenant:%s:drivers:all", tenantID),
		fmt.Sprintf("tenant:%s:employees:all", tenantID),
		fmt.Sprintf("tenant:%s:vehicles:all", tenantID),
	)

	resp := s.MapToResponse(ctx, *e)
	return &resp, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	deleted, err := s.repo.Delete(ctx, tenantID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("expense record not found")
	}

	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:expenses:all", tenantID))
	return nil
}

func (s *Service) GetVehicleEMISummaries(ctx context.Context, tenantID string) ([]VehicleEMISummary, error) {
	return s.repo.GetVehicleEMISummaries(ctx, tenantID)
}

func (s *Service) MapToResponse(ctx context.Context, e Expense) ExpenseResponse {
	recName := ""
	if e.RecipientID != "" {
		recName = s.repo.LookupRecipientName(ctx, e.RecipientType, e.RecipientID)
	}

	vehReg := ""
	if e.VehicleID != "" {
		vehReg = s.repo.LookupVehicleRegNum(ctx, e.VehicleID)
	}

	return ExpenseResponse{
		ID:            e.ID,
		Category:      e.Category,
		Title:         e.Title,
		Amount:        e.Amount,
		ExpenseDate:   e.ExpenseDate.Format("02 Jan 2006, 03:04 PM"),
		RecipientType: e.RecipientType,
		RecipientID:   e.RecipientID,
		RecipientName: recName,
		VehicleID:     e.VehicleID,
		VehicleNumber: vehReg,
		PaymentMode:   e.PaymentMode,
		Notes:         e.Notes,
		CreatedAt:     e.CreatedAt.Format("2006-01-02"),
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
