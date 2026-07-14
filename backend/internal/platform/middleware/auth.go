package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v2"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
)

type authorizedTransport struct {
	base  http.RoundTripper
	token string
}

func (t *authorizedTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	// Copy request to avoid modifying original
	reqCopy := req.Clone(req.Context())
	reqCopy.Header.Set("Authorization", "Bearer "+t.token)
	reqCopy.Header.Set("apikey", t.token)
	return t.base.RoundTrip(reqCopy)
}

// AuthRequired returns a Gin middleware that validates the JWT token
// from the Authorization header using the AARCSX Identity JWKS endpoint.
// It extracts the tenant_id and user_id and injects them into the request context.
func AuthRequired(jwksURL string, anonKey string) gin.HandlerFunc {
	// Initialize the JWKS keyfunc. We do this once and it automatically refreshes in the background.
	options := keyfunc.Options{
		RefreshInterval:  time.Hour,
		RefreshRateLimit: time.Minute * 5,
		RefreshTimeout:   time.Second * 10,
		RefreshErrorHandler: func(err error) {
			log.Printf("[auth middleware] error refreshing JWKS: %v", err)
		},
	}

	if anonKey != "" {
		options.Client = &http.Client{
			Transport: &authorizedTransport{
				base:  http.DefaultTransport,
				token: anonKey,
			},
		}
	}

	jwks, err := keyfunc.Get(jwksURL, options)
	if err != nil {
		log.Fatalf("[auth middleware] Failed to create JWKS from URL %s: %v", jwksURL, err)
	}

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, apperror.New(http.StatusUnauthorized, "Missing Authorization header"))
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, apperror.New(http.StatusUnauthorized, "Invalid Authorization header format. Expected 'Bearer <token>'"))
			return
		}

		tokenString := parts[1]

		// Hash token string to check against blacklist
		hasher := sha256.New()
		hasher.Write([]byte(tokenString))
		tokenHash := hex.EncodeToString(hasher.Sum(nil))

		if TokenBlacklist.IsBlacklisted(tokenHash) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, apperror.New(http.StatusUnauthorized, "Token is revoked"))
			return
		}

		// Parse and verify the token using the JWKS keyfunc
		token, err := jwt.Parse(tokenString, jwks.Keyfunc)
		if err != nil {
			log.Printf("[auth middleware] JWT parse error: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, apperror.New(http.StatusUnauthorized, "Invalid or expired token"))
			return
		}

		if !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, apperror.New(http.StatusUnauthorized, "Invalid token"))
			return
		}

		// Extract custom claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, apperror.New(http.StatusUnauthorized, "Invalid token claims"))
			return
		}

		// AARCSX Identity injects tenant_id for multi-tenancy support
		tenantID, ok := claims["tenant_id"].(string)
		if !ok || tenantID == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, apperror.New(http.StatusForbidden, "Token is missing tenant_id claim. User does not belong to an organization."))
			return
		}

		// Extract standard subject (user_id)
		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, apperror.New(http.StatusUnauthorized, "Token is missing subject claim."))
			return
		}

		// Inject into gin context for downstream handlers
		c.Set("tenant_id", tenantID)
		c.Set("user_id", userID)
		c.Set("raw_token", tokenString)
		c.Set("token_claims", claims)

		c.Next()
	}
}

// GetTenantID is a helper to safely retrieve the tenant_id from the context.
func GetTenantID(c *gin.Context) string {
	val, exists := c.Get("tenant_id")
	if !exists {
		return ""
	}
	tenantID, _ := val.(string)
	return tenantID
}

// GetUserID is a helper to safely retrieve the user_id from the context.
func GetUserID(c *gin.Context) string {
	val, exists := c.Get("user_id")
	if !exists {
		return ""
	}
	userID, _ := val.(string)
	return userID
}
