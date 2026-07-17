package settings

import (
	"context"
	"fmt"
	"time"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/cache"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/mail"
)

type Service struct {
	repo       *Repository
	mailClient *mail.Client
}

func NewService(repo *Repository, brevoAPIKey, welcomeFrom string) *Service {
	var mailClient *mail.Client
	if brevoAPIKey != "" {
		mailClient = mail.NewClient(brevoAPIKey, welcomeFrom)
	}
	return &Service{
		repo:       repo,
		mailClient: mailClient,
	}
}

func (s *Service) GetOrCreateProfile(ctx context.Context, tenantID, defaultName, userEmail, userName, orgSlug string) (*TenantProfile, error) {
	var profile TenantProfile
	cacheKey := fmt.Sprintf("tenant:%s:settings", tenantID)
	err := cache.Fetch(ctx, cacheKey, 5*time.Minute, &profile, func() (*TenantProfile, error) {
		p, err := s.repo.GetByTenantID(ctx, tenantID)
		if err != nil {
			return nil, err
		}
		if p == nil {
			// Create default profile
			p = &TenantProfile{
				TenantID:  tenantID,
				Name:      defaultName,
				Logo:      "",
				GstNumber: "",
				PanNumber: "",
				Address:   "",
				Email:     userEmail,
				Phone:     "",
			}
			if err := s.repo.Create(ctx, p); err != nil {
				return nil, err
			}

			// Trigger "Welcome to Deposity" email!
			if s.mailClient != nil && userEmail != "" {
				go func(email, name, oName, oSlug, tID string) {
					if err := s.mailClient.SendWelcomeEmail(email, name, oName, oSlug, tID); err != nil {
						println("[mail] Failed to send welcome email:", err.Error())
					}
				}(userEmail, userName, defaultName, orgSlug, tenantID)
			}
		}
		return p, nil
	})
	if err != nil {
		return nil, err
	}
	return &profile, nil
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

	// Invalidate settings cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:settings", tenantID))

	return profile, nil
}

func (s *Service) DeleteProfile(ctx context.Context, tenantID string) error {
	// Invalidate settings cache
	cache.Invalidate(ctx, fmt.Sprintf("tenant:%s:settings", tenantID))
	return s.repo.DeleteAllTenantData(ctx, tenantID)
}

