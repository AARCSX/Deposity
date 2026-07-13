package companies

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

// GetAll returns all companies for the given tenant.
func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]Company, error) {
	query := `
		SELECT id, tenant_id, name, logo, status, location, contact_person, phone, email, total_value, is_paid, pending_amount, industry, created_at, updated_at
		FROM companies
		WHERE tenant_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Company
	for rows.Next() {
		var c Company
		err := rows.Scan(
			&c.ID, &c.TenantID, &c.Name, &c.Logo, &c.Status, &c.Location,
			&c.ContactPerson, &c.Phone, &c.Email, &c.TotalValue, &c.IsPaid,
			&c.PendingAmount, &c.Industry, &c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, c)
	}

	return list, nil
}

// GetByID returns a single company by ID, scoped to the tenant.
func (r *Repository) GetByID(ctx context.Context, tenantID, id string) (*Company, error) {
	query := `
		SELECT id, tenant_id, name, logo, status, location, contact_person, phone, email, total_value, is_paid, pending_amount, industry, created_at, updated_at
		FROM companies
		WHERE tenant_id = $1 AND id = $2
	`
	var c Company
	err := r.pool.QueryRow(ctx, query, tenantID, id).Scan(
		&c.ID, &c.TenantID, &c.Name, &c.Logo, &c.Status, &c.Location,
		&c.ContactPerson, &c.Phone, &c.Email, &c.TotalValue, &c.IsPaid,
		&c.PendingAmount, &c.Industry, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &c, nil
}

// Create inserts a new company.
func (r *Repository) Create(ctx context.Context, tenantID string, c *Company) error {
	query := `
		INSERT INTO companies (tenant_id, name, logo, status, location, contact_person, phone, email, total_value, is_paid, pending_amount, industry)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		tenantID, c.Name, c.Logo, c.Status, c.Location,
		c.ContactPerson, &c.Phone, c.Email, c.TotalValue, c.IsPaid,
		c.PendingAmount, c.Industry,
	).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

// Update updates an existing company.
func (r *Repository) Update(ctx context.Context, tenantID, id string, updateFn func(*Company) error) (*Company, error) {
	// Run in transaction to ensure consistency
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// Fetch existing
	querySelect := `
		SELECT id, tenant_id, name, logo, status, location, contact_person, phone, email, total_value, is_paid, pending_amount, industry, created_at, updated_at
		FROM companies
		WHERE tenant_id = $1 AND id = $2
	`
	var c Company
	err = tx.QueryRow(ctx, querySelect, tenantID, id).Scan(
		&c.ID, &c.TenantID, &c.Name, &c.Logo, &c.Status, &c.Location,
		&c.ContactPerson, &c.Phone, &c.Email, &c.TotalValue, &c.IsPaid,
		&c.PendingAmount, &c.Industry, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// Apply updates
	if err := updateFn(&c); err != nil {
		return nil, err
	}

	queryUpdate := `
		UPDATE companies
		SET name = $1, logo = $2, status = $3, location = $4, contact_person = $5, phone = $6, email = $7, total_value = $8, is_paid = $9, pending_amount = $10, industry = $11, updated_at = NOW()
		WHERE tenant_id = $12 AND id = $13
		RETURNING updated_at
	`
	err = tx.QueryRow(ctx, queryUpdate,
		c.Name, c.Logo, c.Status, c.Location, c.ContactPerson, c.Phone, c.Email, c.TotalValue, c.IsPaid, c.PendingAmount, c.Industry,
		tenantID, id,
	).Scan(&c.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &c, nil
}

// Delete removes a company.
func (r *Repository) Delete(ctx context.Context, tenantID, id string) (bool, error) {
	query := `DELETE FROM companies WHERE tenant_id = $1 AND id = $2`
	res, err := r.pool.Exec(ctx, query, tenantID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}