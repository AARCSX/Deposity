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

// GetAll returns all vehicles for the given tenant with resolved driver info.
func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]Vehicle, error) {
	query := `
		SELECT v.id, v.tenant_id, v.registration_number, v.make, v.model, v.year, v.body_type, v.axle_config, v.tonnage_capacity, v.fuel_capacity, v.average_mileage,
		       v.rc_expiry, v.rc_issuance, v.insurance_expiry, v.insurance_issuance, v.puc_expiry, v.puc_issuance, v.fitness_expiry, v.fitness_issuance, v.fastag_expiry, v.fastag_issuance, v.permit_details,
		       v.ownership_type, v.driver_id, v.home_branch, v.gps_device_id,
		       v.current_odometer, v.last_serviced_date, v.status, v.created_at, v.updated_at,
		       COALESCE(d.name, '') AS driver_name, COALESCE(d.phone, '') AS driver_phone
		FROM vehicles v
		LEFT JOIN drivers d ON v.driver_id = d.id
		WHERE v.tenant_id = $1
		ORDER BY v.created_at DESC
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
			&v.RCExpiry, &v.RCIssuance, &v.InsuranceExpiry, &v.InsuranceIssuance, &v.PUCExpiry, &v.PUCIssuance, &v.FitnessExpiry, &v.FitnessIssuance, &v.FASTagExpiry, &v.FASTagIssuance, &v.PermitDetails,
			&v.OwnershipType, &driverID, &v.HomeBranch, &v.GPSDeviceID,
			&v.CurrentOdometer, &v.LastServicedDate, &v.Status, &v.CreatedAt, &v.UpdatedAt,
			&v.DriverName, &v.DriverPhone,
		)
		if err != nil {
			return nil, err
		}
		v.DriverID = driverID
		list = append(list, v)
	}

	return list, nil
}

// GetByID returns a single vehicle by ID, scoped to the tenant, with resolved driver info.
func (r *Repository) GetByID(ctx context.Context, tenantID, id string) (*Vehicle, error) {
	query := `
		SELECT v.id, v.tenant_id, v.registration_number, v.make, v.model, v.year, v.body_type, v.axle_config, v.tonnage_capacity, v.fuel_capacity, v.average_mileage,
		       v.rc_expiry, v.rc_issuance, v.insurance_expiry, v.insurance_issuance, v.puc_expiry, v.puc_issuance, v.fitness_expiry, v.fitness_issuance, v.fastag_expiry, v.fastag_issuance, v.permit_details,
		       v.ownership_type, v.driver_id, v.home_branch, v.gps_device_id,
		       v.current_odometer, v.last_serviced_date, v.status, v.created_at, v.updated_at,
		       COALESCE(d.name, '') AS driver_name, COALESCE(d.phone, '') AS driver_phone
		FROM vehicles v
		LEFT JOIN drivers d ON v.driver_id = d.id
		WHERE v.tenant_id = $1 AND v.id = $2
	`
	var v Vehicle
	var driverID sql.NullString
	err := r.pool.QueryRow(ctx, query, tenantID, id).Scan(
		&v.ID, &v.TenantID, &v.RegistrationNumber, &v.Make, &v.Model, &v.Year, &v.BodyType, &v.AxleConfig, &v.TonnageCapacity, &v.FuelCapacity, &v.AverageMileage,
		&v.RCExpiry, &v.RCIssuance, &v.InsuranceExpiry, &v.InsuranceIssuance, &v.PUCExpiry, &v.PUCIssuance, &v.FitnessExpiry, &v.FitnessIssuance, &v.FASTagExpiry, &v.FASTagIssuance, &v.PermitDetails,
		&v.OwnershipType, &driverID, &v.HomeBranch, &v.GPSDeviceID,
		&v.CurrentOdometer, &v.LastServicedDate, &v.Status, &v.CreatedAt, &v.UpdatedAt,
		&v.DriverName, &v.DriverPhone,
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
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO vehicles (
			tenant_id, registration_number, make, model, year, body_type, axle_config, tonnage_capacity, fuel_capacity, average_mileage,
			rc_expiry, rc_issuance, insurance_expiry, insurance_issuance, puc_expiry, puc_issuance, fitness_expiry, fitness_issuance, fastag_expiry, fastag_issuance, permit_details,
			ownership_type, driver_id, home_branch, gps_device_id,
			current_odometer, last_serviced_date, status
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
		RETURNING id, created_at, updated_at
	`
	var driverID interface{}
	if v.DriverID.Valid {
		driverID = v.DriverID.String
	} else {
		driverID = nil
	}

	err = tx.QueryRow(ctx, query,
		tenantID, v.RegistrationNumber, v.Make, v.Model, v.Year, v.BodyType, v.AxleConfig, v.TonnageCapacity, v.FuelCapacity, v.AverageMileage,
		v.RCExpiry, v.RCIssuance, v.InsuranceExpiry, v.InsuranceIssuance, v.PUCExpiry, v.PUCIssuance, v.FitnessExpiry, v.FitnessIssuance, v.FASTagExpiry, v.FASTagIssuance, v.PermitDetails,
		v.OwnershipType, driverID, v.HomeBranch, v.GPSDeviceID,
		v.CurrentOdometer, v.LastServicedDate, v.Status,
	).Scan(&v.ID, &v.CreatedAt, &v.UpdatedAt)
	if err != nil {
		return err
	}

	if v.DriverID.Valid {
		_, err = tx.Exec(ctx, `UPDATE vehicles SET driver_id = NULL WHERE driver_id = $1 AND id != $2 AND tenant_id = $3`, v.DriverID.String, v.ID, tenantID)
		if err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `UPDATE drivers SET vehicle_id = $1 WHERE id = $2 AND tenant_id = $3`, v.ID, v.DriverID.String, tenantID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
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
		       rc_expiry, rc_issuance, insurance_expiry, insurance_issuance, puc_expiry, puc_issuance, fitness_expiry, fitness_issuance, fastag_expiry, fastag_issuance, permit_details,
		       ownership_type, driver_id, home_branch, gps_device_id,
		       current_odometer, last_serviced_date, status, created_at, updated_at
		FROM vehicles
		WHERE tenant_id = $1 AND id = $2
	`
	var v Vehicle
	var oldDriverID sql.NullString
	err = tx.QueryRow(ctx, querySelect, tenantID, id).Scan(
		&v.ID, &v.TenantID, &v.RegistrationNumber, &v.Make, &v.Model, &v.Year, &v.BodyType, &v.AxleConfig, &v.TonnageCapacity, &v.FuelCapacity, &v.AverageMileage,
		&v.RCExpiry, &v.RCIssuance, &v.InsuranceExpiry, &v.InsuranceIssuance, &v.PUCExpiry, &v.PUCIssuance, &v.FitnessExpiry, &v.FitnessIssuance, &v.FASTagExpiry, &v.FASTagIssuance, &v.PermitDetails,
		&v.OwnershipType, &oldDriverID, &v.HomeBranch, &v.GPSDeviceID,
		&v.CurrentOdometer, &v.LastServicedDate, &v.Status, &v.CreatedAt, &v.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	v.DriverID = oldDriverID

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
		    rc_expiry = $10, rc_issuance = $11, insurance_expiry = $12, insurance_issuance = $13, puc_expiry = $14, puc_issuance = $15, fitness_expiry = $16, fitness_issuance = $17, fastag_expiry = $18, fastag_issuance = $19, permit_details = $20,
		    ownership_type = $21, driver_id = $22, home_branch = $23, gps_device_id = $24,
		    current_odometer = $25, last_serviced_date = $26, status = $27, updated_at = NOW()
		WHERE tenant_id = $28 AND id = $29
		RETURNING updated_at
	`
	err = tx.QueryRow(ctx, queryUpdate,
		v.RegistrationNumber, v.Make, v.Model, v.Year, v.BodyType, v.AxleConfig, v.TonnageCapacity, v.FuelCapacity, v.AverageMileage,
		v.RCExpiry, v.RCIssuance, v.InsuranceExpiry, v.InsuranceIssuance, v.PUCExpiry, v.PUCIssuance, v.FitnessExpiry, v.FitnessIssuance, v.FASTagExpiry, v.FASTagIssuance, v.PermitDetails,
		v.OwnershipType, dbDriverID, v.HomeBranch, v.GPSDeviceID,
		v.CurrentOdometer, v.LastServicedDate, v.Status,
		tenantID, id,
	).Scan(&v.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if oldDriverID.Valid && (!v.DriverID.Valid || v.DriverID.String != oldDriverID.String) {
		_, err = tx.Exec(ctx, `UPDATE drivers SET vehicle_id = NULL WHERE id = $1 AND vehicle_id = $2 AND tenant_id = $3`, oldDriverID.String, v.ID, tenantID)
		if err != nil {
			return nil, err
		}
	}
	if v.DriverID.Valid && (!oldDriverID.Valid || v.DriverID.String != oldDriverID.String) {
		_, err = tx.Exec(ctx, `UPDATE vehicles SET driver_id = NULL WHERE driver_id = $1 AND id != $2 AND tenant_id = $3`, v.DriverID.String, v.ID, tenantID)
		if err != nil {
			return nil, err
		}
		_, err = tx.Exec(ctx, `UPDATE drivers SET vehicle_id = NULL WHERE vehicle_id = $1 AND id != $2 AND tenant_id = $3`, v.ID, v.DriverID.String, tenantID)
		if err != nil {
			return nil, err
		}
		_, err = tx.Exec(ctx, `UPDATE drivers SET vehicle_id = $1 WHERE id = $2 AND tenant_id = $3`, v.ID, v.DriverID.String, tenantID)
		if err != nil {
			return nil, err
		}
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