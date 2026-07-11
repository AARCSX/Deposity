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
	// Neon pooling endpoints typically support up to 10-15 concurrent connections.
	poolConfig.MaxConns = 10
	poolConfig.MinConns = 2
	poolConfig.MaxConnLifetime = 30 * time.Minute
	poolConfig.MaxConnIdleTime = 5 * time.Minute
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
