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

// GetAll returns all companies for the given tenant with live aggregated trip financials.
func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]Company, error) {
	query := `
		SELECT 
			c.id, c.tenant_id, c.name, 
			COALESCE(c.logo, '') as logo, 
			COALESCE(c.status, 'Standard Account') as status, 
			COALESCE(c.location, '') as location, 
			COALESCE(c.contact_person, '') as contact_person, 
			COALESCE(c.phone, '') as phone, 
			COALESCE(c.email, '') as email, 
			COALESCE(SUM(t.total_freight), c.total_value) as total_value, 
			CASE WHEN COALESCE(SUM(GREATEST(0, t.total_freight - t.advance_paid)), c.pending_amount) <= 0 THEN true ELSE false END as is_paid, 
			COALESCE(SUM(GREATEST(0, t.total_freight - t.advance_paid)), c.pending_amount) as pending_amount, 
			COALESCE(c.industry, '') as industry, 
			c.created_at, c.updated_at
		FROM companies c
		LEFT JOIN trips t ON (t.tenant_id = c.tenant_id AND (t.company_id = c.id OR LOWER(t.company_id) = LOWER(c.name)))
		WHERE c.tenant_id = $1
		GROUP BY c.id, c.tenant_id, c.name, c.logo, c.status, c.location, c.contact_person, c.phone, c.email, c.total_value, c.is_paid, c.pending_amount, c.industry, c.created_at, c.updated_at
		ORDER BY c.created_at DESC
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
		SELECT 
			id, tenant_id, name, 
			COALESCE(logo, '') as logo, 
			COALESCE(status, 'Standard Account') as status, 
			COALESCE(location, '') as location, 
			COALESCE(contact_person, '') as contact_person, 
			COALESCE(phone, '') as phone, 
			COALESCE(email, '') as email, 
			total_value, is_paid, pending_amount, 
			COALESCE(industry, '') as industry, 
			created_at, updated_at
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
		c.ContactPerson, c.Phone, c.Email, c.TotalValue, c.IsPaid,
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
		SELECT 
			id, tenant_id, name, 
			COALESCE(logo, '') as logo, 
			COALESCE(status, 'Standard Account') as status, 
			COALESCE(location, '') as location, 
			COALESCE(contact_person, '') as contact_person, 
			COALESCE(phone, '') as phone, 
			COALESCE(email, '') as email, 
			total_value, is_paid, pending_amount, 
			COALESCE(industry, '') as industry, 
			created_at, updated_at
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