package employees

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

func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]Employee, error) {
	// 1. Auto-sync missing active organization members from Identity into employees table
	syncQuery := `
		INSERT INTO employees (tenant_id, name, role, phone, email, joining_date, base_salary, pending_balance, status, avatar)
		SELECT 
			$1 AS tenant_id,
			COALESCE(NULLIF(p.full_name, ''), SPLIT_PART(p.email, '@', 1), 'Staff Member') AS name,
			COALESCE(m.role, 'Employee') AS role,
			COALESCE(p.phone, '+91 9876543210') AS phone,
			p.email,
			COALESCE(m.joined_at, m.created_at, NOW()) AS joining_date,
			CASE WHEN LOWER(m.role) = 'owner' THEN 0 ELSE 25000 END AS base_salary,
			0 AS pending_balance,
			'Active' AS status,
			COALESCE(p.avatar_url, '') AS avatar
		FROM public.organization_members m
		JOIN public.organizations o ON o.id = m.organization_id
		JOIN public.profiles p ON p.id = m.user_id
		WHERE (o.tenant_id = $1 OR o.slug = $1 OR o.id::text = $1)
		  AND NOT EXISTS (
		    SELECT 1 FROM employees e 
		    WHERE e.tenant_id = $1 AND (LOWER(e.email) = LOWER(p.email) OR e.name = p.full_name)
		  )
	`
	_, _ = r.pool.Exec(ctx, syncQuery, tenantID)

	// 2. Sync roles for existing members
	roleSyncQuery := `
		UPDATE employees e
		SET role = m.role
		FROM public.organization_members m
		JOIN public.organizations o ON o.id = m.organization_id
		JOIN public.profiles p ON p.id = m.user_id
		WHERE e.tenant_id = $1
		  AND (o.tenant_id = $1 OR o.slug = $1 OR o.id::text = $1)
		  AND LOWER(e.email) = LOWER(p.email)
		  AND e.role <> m.role
	`
	_, _ = r.pool.Exec(ctx, roleSyncQuery, tenantID)

	query := `
		SELECT id, tenant_id, name, role, phone, COALESCE(email, ''), joining_date,
		       base_salary, pending_balance, status, COALESCE(avatar, ''), created_at, updated_at
		FROM employees
		WHERE tenant_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Employee
	for rows.Next() {
		var e Employee
		err := rows.Scan(
			&e.ID, &e.TenantID, &e.Name, &e.Role, &e.Phone, &e.Email, &e.JoiningDate,
			&e.BaseSalary, &e.PendingBalance, &e.Status, &e.Avatar, &e.CreatedAt, &e.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, e)
	}

	return list, nil
}

func (r *Repository) GetByID(ctx context.Context, tenantID, id string) (*Employee, error) {
	query := `
		SELECT id, tenant_id, name, role, phone, COALESCE(email, ''), joining_date,
		       base_salary, pending_balance, status, COALESCE(avatar, ''), created_at, updated_at
		FROM employees
		WHERE tenant_id = $1 AND id = $2
	`
	var e Employee
	err := r.pool.QueryRow(ctx, query, tenantID, id).Scan(
		&e.ID, &e.TenantID, &e.Name, &e.Role, &e.Phone, &e.Email, &e.JoiningDate,
		&e.BaseSalary, &e.PendingBalance, &e.Status, &e.Avatar, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &e, nil
}

func (r *Repository) Create(ctx context.Context, tenantID string, e *Employee) error {
	query := `
		INSERT INTO employees (tenant_id, name, role, phone, email, joining_date, base_salary, pending_balance, status, avatar)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		tenantID, e.Name, e.Role, e.Phone, e.Email, e.JoiningDate, e.BaseSalary, e.PendingBalance, e.Status, e.Avatar,
	).Scan(&e.ID, &e.CreatedAt, &e.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, tenantID, id string, updateFn func(*Employee) error) (*Employee, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	querySelect := `
		SELECT id, tenant_id, name, role, phone, COALESCE(email, ''), joining_date,
		       base_salary, pending_balance, status, COALESCE(avatar, ''), created_at, updated_at
		FROM employees
		WHERE tenant_id = $1 AND id = $2
	`
	var e Employee
	err = tx.QueryRow(ctx, querySelect, tenantID, id).Scan(
		&e.ID, &e.TenantID, &e.Name, &e.Role, &e.Phone, &e.Email, &e.JoiningDate,
		&e.BaseSalary, &e.PendingBalance, &e.Status, &e.Avatar, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if err := updateFn(&e); err != nil {
		return nil, err
	}

	queryUpdate := `
		UPDATE employees
		SET name = $1, role = $2, phone = $3, email = $4, joining_date = $5,
		    base_salary = $6, pending_balance = $7, status = $8, avatar = $9, updated_at = NOW()
		WHERE tenant_id = $10 AND id = $11
		RETURNING updated_at
	`
	err = tx.QueryRow(ctx, queryUpdate,
		e.Name, e.Role, e.Phone, e.Email, e.JoiningDate,
		e.BaseSalary, e.PendingBalance, e.Status, e.Avatar,
		tenantID, id,
	).Scan(&e.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &e, nil
}

func (r *Repository) Delete(ctx context.Context, tenantID, id string) (bool, error) {
	query := `DELETE FROM employees WHERE tenant_id = $1 AND id = $2`
	res, err := r.pool.Exec(ctx, query, tenantID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}

func (r *Repository) GetSalaryHistory(ctx context.Context, tenantID, recipientType, recipientID string) ([]SalaryPayment, error) {
	query := `
		SELECT id, tenant_id, recipient_type, recipient_id, amount_paid, pending_balance,
		       COALESCE(payment_mode, 'Bank Transfer'), COALESCE(notes, ''), payment_date, created_at
		FROM salary_payments
		WHERE tenant_id = $1 AND LOWER(recipient_type) = LOWER($2) AND recipient_id = $3::uuid
		ORDER BY payment_date DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID, recipientType, recipientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []SalaryPayment
	for rows.Next() {
		var p SalaryPayment
		err := rows.Scan(
			&p.ID, &p.TenantID, &p.RecipientType, &p.RecipientID, &p.AmountPaid, &p.PendingBalance,
			&p.PaymentMode, &p.Notes, &p.PaymentDate, &p.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		payments = append(payments, p)
	}

	return payments, nil
}
