package settings

import (
	"context"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetOrCreateProfile(ctx context.Context, tenantID, defaultName string) (*TenantProfile, error) {
	profile, err := s.repo.GetByTenantID(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	if profile == nil {
		// Create default profile
		profile = &TenantProfile{
			TenantID:  tenantID,
			Name:      defaultName,
			Logo:      "",
			GstNumber: "",
			PanNumber: "",
			Address:   "",
			Email:     "",
			Phone:     "",
		}
		if err := s.repo.Create(ctx, profile); err != nil {
			return nil, err
		}
	}
	return profile, nil
}

func (s *Service) UpdateProfile(ctx context.Context, tenantID string, req UpdateSettingsRequest) (*TenantProfile, error) {
	profile, err := s.repo.GetByTenantID(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	if profile == nil {
		profile = &TenantProfile{
			TenantID: tenantID,
		}
	}

	if req.Name != nil {
		profile.Name = *req.Name
	}
	if req.Logo != nil {
		profile.Logo = *req.Logo
	}
	if req.GstNumber != nil {
		profile.GstNumber = *req.GstNumber
	}
	if req.PanNumber != nil {
		profile.PanNumber = *req.PanNumber
	}
	if req.Address != nil {
		profile.Address = *req.Address
	}
	if req.Email != nil {
		profile.Email = *req.Email
	}
	if req.Phone != nil {
		profile.Phone = *req.Phone
	}

	// Update or Create
	existing, err := s.repo.GetByTenantID(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		if err := s.repo.Create(ctx, profile); err != nil {
			return nil, err
		}
	} else {
		if err := s.repo.Update(ctx, profile); err != nil {
			return nil, err
		}
	}

	return profile, nil
}
