package vehicles

import (
	"context"
	"database/sql"
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

// GetAll returns all vehicles for the given tenant.
func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]Vehicle, error) {
	query := `
		SELECT id, tenant_id, registration_number, make, model, year, body_type, axle_config, tonnage_capacity, fuel_capacity, average_mileage,
		       rc_expiry, insurance_expiry, puc_expiry, fitness_expiry, permit_details,
		       ownership_type, driver_id, home_branch, gps_device_id,
		       current_odometer, last_serviced_date, status, created_at, updated_at
		FROM vehicles
		WHERE tenant_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Vehicle
	for rows.Next() {
		var v Vehicle
		var driverID sql.NullString
		err := rows.Scan(
			&v.ID, &v.TenantID, &v.RegistrationNumber, &v.Make, &v.Model, &v.Year, &v.BodyType, &v.AxleConfig, &v.TonnageCapacity, &v.FuelCapacity, &v.AverageMileage,
			&v.RCExpiry, &v.InsuranceExpiry, &v.PUCExpiry, &v.FitnessExpiry, &v.PermitDetails,
			&v.OwnershipType, &driverID, &v.HomeBranch, &v.GPSDeviceID,
			&v.CurrentOdometer, &v.LastServicedDate, &v.Status, &v.CreatedAt, &v.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		v.DriverID = driverID
		list = append(list, v)
	}

	return list, nil
}

// GetByID returns a single vehicle by ID, scoped to the tenant.
func (r *Repository) GetByID(ctx context.Context, tenantID, id string) (*Vehicle, error) {
	query := `
		SELECT id, tenant_id, registration_number, make, model, year, body_type, axle_config, tonnage_capacity, fuel_capacity, average_mileage,
		       rc_expiry, insurance_expiry, puc_expiry, fitness_expiry, permit_details,
		       ownership_type, driver_id, home_branch, gps_device_id,
		       current_odometer, last_serviced_date, status, created_at, updated_at
		FROM vehicles
		WHERE tenant_id = $1 AND id = $2
	`
	var v Vehicle
	var driverID sql.NullString
	err := r.pool.QueryRow(ctx, query, tenantID, id).Scan(
		&v.ID, &v.TenantID, &v.RegistrationNumber, &v.Make, &v.Model, &v.Year, &v.BodyType, &v.AxleConfig, &v.TonnageCapacity, &v.FuelCapacity, &v.AverageMileage,
		&v.RCExpiry, &v.InsuranceExpiry, &v.PUCExpiry, &v.FitnessExpiry, &v.PermitDetails,
		&v.OwnershipType, &driverID, &v.HomeBranch, &v.GPSDeviceID,
		&v.CurrentOdometer, &v.LastServicedDate, &v.Status, &v.CreatedAt, &v.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	v.DriverID = driverID

	return &v, nil
}

// Create inserts a new vehicle.
func (r *Repository) Create(ctx context.Context, tenantID string, v *Vehicle) error {
	query := `
		INSERT INTO vehicles (
			tenant_id, registration_number, make, model, year, body_type, axle_config, tonnage_capacity, fuel_capacity, average_mileage,
			rc_expiry, insurance_expiry, puc_expiry, fitness_expiry, permit_details,
			ownership_type, driver_id, home_branch, gps_device_id,
			current_odometer, last_serviced_date, status
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
		RETURNING id, created_at, updated_at
	`
	var driverID interface{}
	if v.DriverID.Valid {
		driverID = v.DriverID.String
	} else {
		driverID = nil
	}

	return r.pool.QueryRow(ctx, query,
		tenantID, v.RegistrationNumber, v.Make, v.Model, v.Year, v.BodyType, v.AxleConfig, v.TonnageCapacity, v.FuelCapacity, v.AverageMileage,
		v.RCExpiry, v.InsuranceExpiry, v.PUCExpiry, v.FitnessExpiry, v.PermitDetails,
		v.OwnershipType, driverID, v.HomeBranch, v.GPSDeviceID,
		v.CurrentOdometer, v.LastServicedDate, v.Status,
	).Scan(&v.ID, &v.CreatedAt, &v.UpdatedAt)
}

// Update updates an existing vehicle within a transaction.
func (r *Repository) Update(ctx context.Context, tenantID, id string, updateFn func(*Vehicle) error) (*Vehicle, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	querySelect := `
		SELECT id, tenant_id, registration_number, make, model, year, body_type, axle_config, tonnage_capacity, fuel_capacity, average_mileage,
		       rc_expiry, insurance_expiry, puc_expiry, fitness_expiry, permit_details,
		       ownership_type, driver_id, home_branch, gps_device_id,
		       current_odometer, last_serviced_date, status, created_at, updated_at
		FROM vehicles
		WHERE tenant_id = $1 AND id = $2
	`
	var v Vehicle
	var driverID sql.NullString
	err = tx.QueryRow(ctx, querySelect, tenantID, id).Scan(
		&v.ID, &v.TenantID, &v.RegistrationNumber, &v.Make, &v.Model, &v.Year, &v.BodyType, &v.AxleConfig, &v.TonnageCapacity, &v.FuelCapacity, &v.AverageMileage,
		&v.RCExpiry, &v.InsuranceExpiry, &v.PUCExpiry, &v.FitnessExpiry, &v.PermitDetails,
		&v.OwnershipType, &driverID, &v.HomeBranch, &v.GPSDeviceID,
		&v.CurrentOdometer, &v.LastServicedDate, &v.Status, &v.CreatedAt, &v.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	v.DriverID = driverID

	if err := updateFn(&v); err != nil {
		return nil, err
	}

	var dbDriverID interface{}
	if v.DriverID.Valid {
		dbDriverID = v.DriverID.String
	} else {
		dbDriverID = nil
	}

	queryUpdate := `
		UPDATE vehicles
		SET registration_number = $1, make = $2, model = $3, year = $4, body_type = $5, axle_config = $6, tonnage_capacity = $7, fuel_capacity = $8, average_mileage = $9,
		    rc_expiry = $10, insurance_expiry = $11, puc_expiry = $12, fitness_expiry = $13, permit_details = $14,
		    ownership_type = $15, driver_id = $16, home_branch = $17, gps_device_id = $18,
		    current_odometer = $19, last_serviced_date = $20, status = $21, updated_at = NOW()
		WHERE tenant_id = $22 AND id = $23
		RETURNING updated_at
	`
	err = tx.QueryRow(ctx, queryUpdate,
		v.RegistrationNumber, v.Make, v.Model, v.Year, v.BodyType, v.AxleConfig, v.TonnageCapacity, v.FuelCapacity, v.AverageMileage,
		v.RCExpiry, v.InsuranceExpiry, v.PUCExpiry, v.FitnessExpiry, v.PermitDetails,
		v.OwnershipType, dbDriverID, v.HomeBranch, v.GPSDeviceID,
		v.CurrentOdometer, v.LastServicedDate, v.Status,
		tenantID, id,
	).Scan(&v.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &v, nil
}

// Delete removes a vehicle.
func (r *Repository) Delete(ctx context.Context, tenantID, id string) (bool, error) {
	query := `DELETE FROM vehicles WHERE tenant_id = $1 AND id = $2`
	res, err := r.pool.Exec(ctx, query, tenantID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}