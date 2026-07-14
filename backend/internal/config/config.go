package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	Port                     string
	DatabaseURL              string
	CORSOrigins              string
	IdentityURL              string
	IdentityJWKS             string
	IdentityAnonKey          string
	BrevoAPIKey              string
	EmailDeposityWelcomeFrom string
}

// Load reads environment variables (with .env fallback) and returns a Config.
// It panics if the critical DATABASE_URL variable is missing.
func Load() *Config {
	// Attempt to load .env file; silently ignore if not found (production won't have one).
	_ = godotenv.Load()

	cfg := &Config{
		Port:                     getEnv("PORT", "8080"),
		DatabaseURL:              getEnv("DATABASE_URL", ""),
		CORSOrigins:              getEnv("CORS_ORIGINS", "http://localhost:3000"),
		IdentityURL:              getEnv("IDENTITY_URL", "https://identity.aarcsx.com/functions/v1"),
		IdentityJWKS:             getEnv("IDENTITY_JWKS", "https://zrxdlanspjqewyqurvvl.supabase.co/functions/v1/oauth-jwks"),
		IdentityAnonKey:          getEnv("IDENTITY_ANON_KEY", ""),
		BrevoAPIKey:              getEnv("BREVO_API_KEY", ""),
		EmailDeposityWelcomeFrom: getEnv("EMAIL_DEPOSITY_WELCOME_FROM", "welcome@deposity.aarcsx.com"),
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("[config] FATAL: DATABASE_URL environment variable is required but not set")
	}

	return cfg
}

// getEnv reads an environment variable or returns a fallback default.
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
