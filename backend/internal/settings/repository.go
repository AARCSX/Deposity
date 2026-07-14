package settings

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

// GetByTenantID retrieves the profile for a given tenant.
func (r *Repository) GetByTenantID(ctx context.Context, tenantID string) (*TenantProfile, error) {
	query := `
		SELECT tenant_id, name, logo, gst_number, pan_number, address, email, phone, created_at, updated_at
		FROM tenant_profiles
		WHERE tenant_id = $1
	`
	var p TenantProfile
	err := r.pool.QueryRow(ctx, query, tenantID).Scan(
		&p.TenantID, &p.Name, &p.Logo, &p.GstNumber, &p.PanNumber, &p.Address, &p.Email, &p.Phone, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

// Create inserts a new profile for a tenant.
func (r *Repository) Create(ctx context.Context, p *TenantProfile) error {
	query := `
		INSERT INTO tenant_profiles (tenant_id, name, logo, gst_number, pan_number, address, email, phone)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		p.TenantID, p.Name, p.Logo, p.GstNumber, p.PanNumber, p.Address, p.Email, p.Phone,
	).Scan(&p.CreatedAt, &p.UpdatedAt)
}

// Update updates an existing profile for a tenant.
func (r *Repository) Update(ctx context.Context, p *TenantProfile) error {
	query := `
		UPDATE tenant_profiles
		SET name = $1, logo = $2, gst_number = $3, pan_number = $4, address = $5, email = $6, phone = $7, updated_at = NOW()
		WHERE tenant_id = $8
		RETURNING updated_at
	`
	return r.pool.QueryRow(ctx, query,
		p.Name, p.Logo, p.GstNumber, p.PanNumber, p.Address, p.Email, p.Phone, p.TenantID,
	).Scan(&p.UpdatedAt)
}

// DeleteAllTenantData deletes the tenant profile and all associated data within a transaction.
func (r *Repository) DeleteAllTenantData(ctx context.Context, tenantID string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Break cyclic foreign key relationships to prevent constraint failures
	if _, err := tx.Exec(ctx, "UPDATE vehicles SET driver_id = NULL WHERE tenant_id = $1", tenantID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, "UPDATE drivers SET vehicle_id = NULL WHERE tenant_id = $1", tenantID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, "UPDATE trips SET vehicle_id = NULL, driver_id = NULL WHERE tenant_id = $1", tenantID); err != nil {
		return err
	}

	// 2. Cascade delete all records belonging to the tenant
	tables := []string{
		"trips",
		"maintenance",
		"vehicles",
		"drivers",
		"companies",
		"tenant_profiles",
	}

	for _, table := range tables {
		query := "DELETE FROM " + table + " WHERE tenant_id = $1"
		if _, err := tx.Exec(ctx, query, tenantID); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

