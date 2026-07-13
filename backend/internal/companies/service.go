package companies

import (
	"context"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetAll(ctx context.Context, tenantID string) ([]Company, error) {
	return s.repo.GetAll(ctx, tenantID)
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*Company, error) {
	c, err := s.repo.GetByID(ctx, tenantID, id)
	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, apperror.NotFound("company not found")
	}
	return c, nil
}

func (s *Service) Create(ctx context.Context, tenantID string, req CreateCompanyRequest) (*Company, error) {
	isPaid := true
	if req.IsPaid != nil {
		isPaid = *req.IsPaid
	}

	status := "Standard Account"
	if req.Status != "" {
		status = req.Status
	}

	c := &Company{
		TenantID:      tenantID,
		Name:          req.Name,
		Logo:          req.Logo,
		Status:        status,
		Location:      req.Location,
		ContactPerson: req.ContactPerson,
		Phone:         req.Phone,
		Email:         req.Email,
		TotalValue:    req.TotalValue,
		IsPaid:        isPaid,
		PendingAmount: req.PendingAmount,
		Industry:      req.Industry,
	}

	if err := s.repo.Create(ctx, tenantID, c); err != nil {
		return nil, err
	}

	return c, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, req UpdateCompanyRequest) (*Company, error) {
	c, err := s.repo.Update(ctx, tenantID, id, func(c *Company) error {
		if req.Name != nil {
			c.Name = *req.Name
		}
		if req.Logo != nil {
			c.Logo = *req.Logo
		}
		if req.Status != nil {
			c.Status = *req.Status
		}
		if req.Location != nil {
			c.Location = *req.Location
		}
		if req.ContactPerson != nil {
			c.ContactPerson = *req.ContactPerson
		}
		if req.Phone != nil {
			c.Phone = *req.Phone
		}
		if req.Email != nil {
			c.Email = *req.Email
		}
		if req.TotalValue != nil {
			c.TotalValue = *req.TotalValue
		}
		if req.IsPaid != nil {
			c.IsPaid = *req.IsPaid
		}
		if req.PendingAmount != nil {
			c.PendingAmount = *req.PendingAmount
		}
		if req.Industry != nil {
			c.Industry = *req.Industry
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, apperror.NotFound("company not found")
	}

	return c, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	deleted, err := s.repo.Delete(ctx, tenantID, id)
	if err != nil {
		return err
	}
	if !deleted {
		return apperror.NotFound("company not found")
	}
	return nil
}