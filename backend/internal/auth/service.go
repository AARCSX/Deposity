package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
)

// Service handles interactions with the AARCSX Identity provider.
type Service struct {
	identityURL string
	anonKey     string
	httpClient  *http.Client
}

// NewService creates a new Auth service configured to talk to AARCSX Identity.
func NewService(identityURL string, anonKey string) *Service {
	return &Service{
		identityURL: identityURL,
		anonKey:     anonKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// ExchangeCode calls the AARCSX Identity /oauth-token edge function to mint JWTs.
func (s *Service) ExchangeCode(ctx context.Context, req ExchangeCodeRequest) (*TokenResponse, error) {
	// Prepare the exact payload expected by AARCSX Identity's OIDC engine
	payload := map[string]string{
		"grant_type":    "authorization_code",
		"client_id":     "deposity_client", // Hardcoded client ID for this product
		"redirect_uri":  req.RedirectURI,
		"code":          req.Code,
		"code_verifier": req.CodeVerifier,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, apperror.Internal("failed to marshal token exchange payload")
	}

	url := fmt.Sprintf("%s/oauth-token", s.identityURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, apperror.Internal("failed to create token exchange request")
	}
	httpReq.Header.Set("Content-Type", "application/json")
	if s.anonKey != "" {
		httpReq.Header.Set("Authorization", "Bearer "+s.anonKey)
		httpReq.Header.Set("apikey", s.anonKey)
	}

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, apperror.Internal("network error contacting identity provider")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// Log the actual error from Identity for debugging, but return a clean error to frontend
		return nil, apperror.New(resp.StatusCode, "identity provider rejected the authorization code")
	}

	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, apperror.Internal("failed to parse token response from identity provider")
	}

	return &tokenResp, nil
}

// RefreshToken calls the AARCSX Identity /oauth-token edge function with grant_type=refresh_token.
func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error) {
	payload := map[string]string{
		"grant_type":    "refresh_token",
		"client_id":     "deposity_client",
		"refresh_token": refreshToken,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, apperror.Internal("failed to marshal refresh token payload")
	}

	url := fmt.Sprintf("%s/oauth-token", s.identityURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, apperror.Internal("failed to create refresh token request")
	}
	httpReq.Header.Set("Content-Type", "application/json")
	if s.anonKey != "" {
		httpReq.Header.Set("Authorization", "Bearer "+s.anonKey)
		httpReq.Header.Set("apikey", s.anonKey)
	}

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, apperror.Internal("network error contacting identity provider")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, apperror.New(resp.StatusCode, "identity provider rejected the refresh token")
	}

	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, apperror.Internal("failed to parse refresh token response from identity provider")
	}

	return &tokenResp, nil
}