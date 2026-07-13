package database

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// RunMigrations runs all .up.sql files located in the specified directory in order.
func RunMigrations(ctx context.Context, pool *pgxpool.Pool, migrationsDir string) error {
	log.Printf("[database] Starting database migrations from directory: %s", migrationsDir)

	files, err := ioutil.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var upMigrations []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".up.sql") {
			upMigrations = append(upMigrations, file.Name())
		}
	}

	// Sort alphabetically to ensure correct run order (e.g. 000001, 000002...)
	sort.Strings(upMigrations)

	// We'll create a schema_migrations table if it doesn't exist, to track applied migrations
	_, err = pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version TEXT PRIMARY KEY,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}

	for _, filename := range upMigrations {
		// Check if migration has already been applied
		var exists bool
		err = pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", filename).Scan(&exists)
		if err != nil {
			return fmt.Errorf("failed to check migration state for %s: %w", filename, err)
		}

		if exists {
			log.Printf("[database] Migration %s is already applied. Skipping.", filename)
			continue
		}

		log.Printf("[database] Applying migration %s...", filename)
		content, err := ioutil.ReadFile(filepath.Join(migrationsDir, filename))
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}

		// Execute the migration SQL
		_, err = pool.Exec(ctx, string(content))
		if err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", filename, err)
		}

		// Record the migration version in schema_migrations
		_, err = pool.Exec(ctx, "INSERT INTO schema_migrations (version) VALUES ($1)", filename)
		if err != nil {
			return fmt.Errorf("failed to record migration completion for %s: %w", filename, err)
		}

		log.Printf("[database] Migration %s applied successfully", filename)
	}

	log.Println("[database] Database migrations completed successfully")
	return nil
}
