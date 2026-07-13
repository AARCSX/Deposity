package auth

// ExchangeCodeRequest represents the JSON payload sent by the Deposity frontend
// after it receives an authorization code from AARCSX Identity.
type ExchangeCodeRequest struct {
	Code         string `json:"code" binding:"required"`
	CodeVerifier string `json:"code_verifier" binding:"required"`
	RedirectURI  string `json:"redirect_uri" binding:"required"` // E.g., http://localhost:3000/callback
}

// TokenResponse is the structure returned by AARCSX Identity /oauth-token
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	IDToken      string `json:"id_token,omitempty"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}