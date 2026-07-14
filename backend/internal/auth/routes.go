package auth

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up the routing for the Auth domain.
// Unlike other domains, this does NOT require the Auth middleware,
// because it is the endpoint responsible for generating the tokens!
func RegisterRoutes(rg *gin.RouterGroup, identityURL string, anonKey string, authMiddleware gin.HandlerFunc) {
	service := NewService(identityURL, anonKey)
	handler := NewHandler(service)

	rg.POST("/callback", handler.ExchangeCode)
	rg.POST("/logout", authMiddleware, handler.Logout)
}