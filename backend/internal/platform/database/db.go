package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Connect establishes a connection pool to the PostgreSQL database.
// It configures pool sizing suitable for Cloud Run (limited connections)
// and verifies connectivity with a ping before returning.
func Connect(ctx context.Context, dsn string) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("database: failed to parse DSN: %w", err)
	}

	// Pool tuning for Neon serverless + Cloud Run.
	// Keep pool limits small to avoid locking up serverless Postgres on autoscaling.
	poolConfig.MaxConns = 4
	poolConfig.MinConns = 2
	poolConfig.MaxConnLifetime = 5 * time.Minute
	poolConfig.MaxConnIdleTime = 2 * time.Minute
	poolConfig.HealthCheckPeriod = 1 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("database: failed to create pool: %w", err)
	}

	// Verify the connection is alive.
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("database: failed to ping: %w", err)
	}

	log.Printf("[database] Connected to PostgreSQL (pool: min=%d, max=%d)",
		poolConfig.MinConns, poolConfig.MaxConns)

	return pool, nil
}
