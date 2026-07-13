package drivers

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

// GetAll returns all drivers for the given tenant with their associated vehicle registration numbers.
func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]DriverResponse, error) {
	query := `
		SELECT d.id, d.name, d.avatar, d.status, d.phone, COALESCE(v.registration_number, '') as vehicle_number, COALESCE(d.vehicle_id::text, '') as vehicle_id, d.license_number, d.license_expiry, d.salary, d.pending_balance, d.is_status_warning
		FROM drivers d
		LEFT JOIN vehicles v ON d.vehicle_id = v.id
		WHERE d.tenant_id = $1
		ORDER BY d.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []DriverResponse
	for rows.Next() {
		var d DriverResponse
		var expiry time.Time
		var salaryVal, balanceVal float64
		err := rows.Scan(
			&d.ID, &d.Name, &d.Avatar, &d.Status, &d.Phone, &d.Vehicle, &d.VehicleID,
			&d.LicenseNumber, &expiry, &salaryVal, &balanceVal, &d.IsStatusWarning,
		)
		if err != nil {
			return nil, err
		}
		
		// Format responses for frontend representation
		d.LicenseExpiry = expiry.Format("02/01/2006") // DD/MM/YYYY
		d.Salary = formatCurrency(salaryVal)
		d.PendingBalance = formatCurrency(balanceVal)
		
		list = append(list, d)
	}

	return list, nil
}

// GetByID returns a single driver by ID, scoped to the tenant.
func (r *Repository) GetByID(ctx context.Context, tenantID, id string) (*DriverResponse, error) {
	query := `
		SELECT d.id, d.name, d.avatar, d.status, d.phone, COALESCE(v.registration_number, '') as vehicle_number, COALESCE(d.vehicle_id::text, '') as vehicle_id, d.license_number, d.license_expiry, d.salary, d.pending_balance, d.is_status_warning
		FROM drivers d
		LEFT JOIN vehicles v ON d.vehicle_id = v.id
		WHERE d.tenant_id = $1 AND d.id = $2
	`
	var d DriverResponse
	var expiry time.Time
	var salaryVal, balanceVal float64
	err := r.pool.QueryRow(ctx, query, tenantID, id).Scan(
		&d.ID, &d.Name, &d.Avatar, &d.Status, &d.Phone, &d.Vehicle, &d.VehicleID,
		&d.LicenseNumber, &expiry, &salaryVal, &balanceVal, &d.IsStatusWarning,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	d.LicenseExpiry = expiry.Format("02/01/2006")
	d.Salary = formatCurrency(salaryVal)
	d.PendingBalance = formatCurrency(balanceVal)

	return &d, nil
}

// Create inserts a new driver.
func (r *Repository) Create(ctx context.Context, tenantID string, d *Driver) error {
	query := `
		INSERT INTO drivers (tenant_id, name, avatar, status, phone, vehicle_id, license_number, license_expiry, salary, pending_balance, is_status_warning)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at
	`
	
	var vehicleID interface{}
	if d.VehicleID.Valid {
		vehicleID = d.VehicleID.String
	} else {
		vehicleID = nil
	}

	return r.pool.QueryRow(ctx, query,
		tenantID, d.Name, d.Avatar, d.Status, d.Phone, vehicleID,
		d.LicenseNumber, d.LicenseExpiry, d.Salary, d.PendingBalance, d.IsStatusWarning,
	).Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
}

// Update updates an existing driver within a transaction.
func (r *Repository) Update(ctx context.Context, tenantID, id string, updateFn func(*Driver) error) (*Driver, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	querySelect := `
		SELECT id, tenant_id, name, avatar, status, phone, vehicle_id, license_number, license_expiry, salary, pending_balance, is_status_warning, created_at, updated_at
		FROM drivers
		WHERE tenant_id = $1 AND id = $2
	`
	var d Driver
	var vehicleID sql.NullString
	err = tx.QueryRow(ctx, querySelect, tenantID, id).Scan(
		&d.ID, &d.TenantID, &d.Name, &d.Avatar, &d.Status, &d.Phone, &vehicleID,
		&d.LicenseNumber, &d.LicenseExpiry, &d.Salary, &d.PendingBalance, &d.IsStatusWarning, &d.CreatedAt, &d.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	d.VehicleID = vehicleID

	if err := updateFn(&d); err != nil {
		return nil, err
	}

	var dbVehicleID interface{}
	if d.VehicleID.Valid {
		dbVehicleID = d.VehicleID.String
	} else {
		dbVehicleID = nil
	}

	queryUpdate := `
		UPDATE drivers
		SET name = $1, avatar = $2, status = $3, phone = $4, vehicle_id = $5, license_number = $6, license_expiry = $7, salary = $8, pending_balance = $9, is_status_warning = $10, updated_at = NOW()
		WHERE tenant_id = $11 AND id = $12
		RETURNING updated_at
	`
	err = tx.QueryRow(ctx, queryUpdate,
		d.Name, d.Avatar, d.Status, d.Phone, dbVehicleID, d.LicenseNumber, d.LicenseExpiry, d.Salary, d.PendingBalance, d.IsStatusWarning,
		tenantID, id,
	).Scan(&d.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &d, nil
}

// Delete removes a driver.
func (r *Repository) Delete(ctx context.Context, tenantID, id string) (bool, error) {
	query := `DELETE FROM drivers WHERE tenant_id = $1 AND id = $2`
	res, err := r.pool.Exec(ctx, query, tenantID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}

// Helper to format currency values to Indian Rupee (₹xx,xxx) format
func formatCurrency(val float64) string {
	if val == 0 {
		return "₹0.00"
	}
	vInt := int(val)
	dec := int((val - float64(vInt)) * 100)
	
	sInt := ""
	for vInt > 0 {
		rem := vInt % 1000
		vInt /= 1000
		if vInt > 0 {
			sInt = fmt.Sprintf(",%03d%s", rem, sInt)
		} else {
			sInt = fmt.Sprintf("%d%s", rem, sInt)
		}
	}
	if sInt == "" {
		sInt = "0"
	}
	
	if dec > 0 {
		return fmt.Sprintf("₹%s.%02d", sInt, dec)
	}
	return fmt.Sprintf("₹%s", sInt)
}