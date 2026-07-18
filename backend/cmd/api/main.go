package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/Akshansh-29072005/Deposity/backend/internal/auth"
	"github.com/Akshansh-29072005/Deposity/backend/internal/companies"
	"github.com/Akshansh-29072005/Deposity/backend/internal/config"
	"github.com/Akshansh-29072005/Deposity/backend/internal/dashboard"
	"github.com/Akshansh-29072005/Deposity/backend/internal/drivers"
	"github.com/Akshansh-29072005/Deposity/backend/internal/maintenance"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/cache"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/database"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/mail"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/middleware"
	"github.com/Akshansh-29072005/Deposity/backend/internal/settings"
	"github.com/Akshansh-29072005/Deposity/backend/internal/trips"
	"github.com/Akshansh-29072005/Deposity/backend/internal/vehicles"
)

func main() {
	// 1. Load application configuration
	cfg := config.Load()

	// Initialize cache and Redis Blacklist if URL is provided
	if cfg.RedisURL != "" {
		cache.Initialize(cfg.RedisURL)
		middleware.InitializeRedisBlacklist(cfg.RedisURL)
	}

	// 2. Establish database connection pool
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("[main] FATAL: Failed to connect to database: %v", err)
	}
	defer pool.Close()

	// Run auto-migrations
	if err := database.RunMigrations(ctx, pool, "migrations"); err != nil {
		log.Fatalf("[main] FATAL: Database migrations failed: %v", err)
	}

	// Start compliance background worker
	if cfg.BrevoAPIKey != "" {
		mailClient := mail.NewClient(cfg.BrevoAPIKey, cfg.EmailDeposityWelcomeFrom)
		vehicles.StartComplianceWorker(context.Background(), pool, mailClient)
	}

	// 3. Initialize Gin engine
	router := gin.Default()

	// Enable CORS for frontend integration
	router.Use(corsMiddleware(cfg.CORSOrigins))

	// Global check route
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "time": time.Now().UTC()})
	})

	// 4. Initialize middlewares
	authMiddleware := middleware.AuthRequired(cfg.IdentityJWKS, cfg.IdentityAnonKey)

	// 5. Register Routes Grouped by API Version
	apiGroup := router.Group("")
	{
		// Auth callback route (no token validation required, but logout requires it)
		auth.RegisterRoutes(apiGroup.Group("/auth"), cfg.IdentityURL, cfg.IdentityAnonKey, authMiddleware)

		// Secure CRUD routes
		companies.RegisterRoutes(apiGroup.Group("/companies"), pool, authMiddleware)
		drivers.RegisterRoutes(apiGroup.Group("/drivers"), pool, authMiddleware)
		vehicles.RegisterRoutes(apiGroup.Group("/vehicles"), pool, authMiddleware)
		trips.RegisterRoutes(apiGroup.Group("/trips"), pool, authMiddleware)
		maintenance.RegisterRoutes(apiGroup.Group("/maintenance"), pool, authMiddleware)
		dashboard.RegisterRoutes(apiGroup.Group("/dashboard"), pool, authMiddleware)
		settings.RegisterRoutes(apiGroup.Group("/settings"), pool, authMiddleware, cfg.BrevoAPIKey, cfg.EmailDeposityWelcomeFrom)
	}

	// 6. Start server
	log.Printf("[main] Server starting on port :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("[main] FATAL: Server failed to start: %v", err)
	}
}

// corsMiddleware configuration permitting communication from dynamic CORS origins config.
func corsMiddleware(allowedOrigins string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}