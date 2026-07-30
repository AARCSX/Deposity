package maintenance

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

// GetAll returns all maintenance records for the given tenant.
func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]Maintenance, error) {
	query := `
		SELECT id, tenant_id, vehicle_id, vehicle_number, maintenance_type, maintenance_date, odometer_reading,
		       service_center, mechanic, cost, description, parts_replaced, next_service_date, next_service_odometer,
		       status, notes, tyre_id, COALESCE(old_battery_serial, ''), COALESCE(new_battery_serial, ''),
		       COALESCE(old_tyre_serial, ''), COALESCE(new_tyre_serial, ''), created_at, updated_at
		FROM maintenance
		WHERE tenant_id = $1
		ORDER BY maintenance_date DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Maintenance
	for rows.Next() {
		var m Maintenance
		err := rows.Scan(
			&m.ID, &m.TenantID, &m.VehicleID, &m.VehicleNumber, &m.MaintenanceType, &m.MaintenanceDate, &m.OdometerReading,
			&m.ServiceCenter, &m.Mechanic, &m.Cost, &m.Description, &m.PartsReplaced, &m.NextServiceDate, &m.NextServiceOdometer,
			&m.Status, &m.Notes, &m.TyreID, &m.OldBatterySerial, &m.NewBatterySerial, &m.OldTyreSerial, &m.NewTyreSerial, &m.CreatedAt, &m.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, m)
	}

	return list, nil
}

// GetByID returns a single maintenance record by ID, scoped to the tenant.
func (r *Repository) GetByID(ctx context.Context, tenantID, id string) (*Maintenance, error) {
	query := `
		SELECT id, tenant_id, vehicle_id, vehicle_number, maintenance_type, maintenance_date, odometer_reading,
		       service_center, mechanic, cost, description, parts_replaced, next_service_date, next_service_odometer,
		       status, notes, tyre_id, COALESCE(old_battery_serial, ''), COALESCE(new_battery_serial, ''),
		       COALESCE(old_tyre_serial, ''), COALESCE(new_tyre_serial, ''), created_at, updated_at
		FROM maintenance
		WHERE tenant_id = $1 AND id = $2
	`
	var m Maintenance
	err := r.pool.QueryRow(ctx, query, tenantID, id).Scan(
		&m.ID, &m.TenantID, &m.VehicleID, &m.VehicleNumber, &m.MaintenanceType, &m.MaintenanceDate, &m.OdometerReading,
		&m.ServiceCenter, &m.Mechanic, &m.Cost, &m.Description, &m.PartsReplaced, &m.NextServiceDate, &m.NextServiceOdometer,
		&m.Status, &m.Notes, &m.TyreID, &m.OldBatterySerial, &m.NewBatterySerial, &m.OldTyreSerial, &m.NewTyreSerial, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &m, nil
}

// Create inserts a new maintenance record.
func (r *Repository) Create(ctx context.Context, tenantID string, m *Maintenance) error {
	query := `
		INSERT INTO maintenance (
			tenant_id, vehicle_id, vehicle_number, maintenance_type, maintenance_date, odometer_reading,
			service_center, mechanic, cost, description, parts_replaced, next_service_date, next_service_odometer,
			status, notes, tyre_id, old_battery_serial, new_battery_serial, old_tyre_serial, new_tyre_serial
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		tenantID, m.VehicleID, m.VehicleNumber, m.MaintenanceType, m.MaintenanceDate, m.OdometerReading,
		m.ServiceCenter, m.Mechanic, m.Cost, m.Description, m.PartsReplaced, m.NextServiceDate, m.NextServiceOdometer,
		m.Status, m.Notes, m.TyreID, m.OldBatterySerial, m.NewBatterySerial, m.OldTyreSerial, m.NewTyreSerial,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
}

// Update updates an existing maintenance record within a transaction.
func (r *Repository) Update(ctx context.Context, tenantID, id string, updateFn func(*Maintenance) error) (*Maintenance, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	querySelect := `
		SELECT id, tenant_id, vehicle_id, vehicle_number, maintenance_type, maintenance_date, odometer_reading,
		       service_center, mechanic, cost, description, parts_replaced, next_service_date, next_service_odometer,
		       status, notes, tyre_id, COALESCE(old_battery_serial, ''), COALESCE(new_battery_serial, ''),
		       COALESCE(old_tyre_serial, ''), COALESCE(new_tyre_serial, ''), created_at, updated_at
		FROM maintenance
		WHERE tenant_id = $1 AND id = $2
	`
	var m Maintenance
	err = tx.QueryRow(ctx, querySelect, tenantID, id).Scan(
		&m.ID, &m.TenantID, &m.VehicleID, &m.VehicleNumber, &m.MaintenanceType, &m.MaintenanceDate, &m.OdometerReading,
		&m.ServiceCenter, &m.Mechanic, &m.Cost, &m.Description, &m.PartsReplaced, &m.NextServiceDate, &m.NextServiceOdometer,
		&m.Status, &m.Notes, &m.TyreID, &m.OldBatterySerial, &m.NewBatterySerial, &m.OldTyreSerial, &m.NewTyreSerial, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if err := updateFn(&m); err != nil {
		return nil, err
	}

	queryUpdate := `
		UPDATE maintenance
		SET vehicle_id = $1, vehicle_number = $2, maintenance_type = $3, maintenance_date = $4, odometer_reading = $5,
		    service_center = $6, mechanic = $7, cost = $8, description = $9, parts_replaced = $10,
		    next_service_date = $11, next_service_odometer = $12, status = $13, notes = $14, tyre_id = $15,
		    old_battery_serial = $16, new_battery_serial = $17, old_tyre_serial = $18, new_tyre_serial = $19, updated_at = NOW()
		WHERE tenant_id = $20 AND id = $21
		RETURNING updated_at
	`
	err = tx.QueryRow(ctx, queryUpdate,
		m.VehicleID, m.VehicleNumber, m.MaintenanceType, m.MaintenanceDate, m.OdometerReading,
		m.ServiceCenter, m.Mechanic, m.Cost, m.Description, m.PartsReplaced,
		m.NextServiceDate, m.NextServiceOdometer, m.Status, m.Notes, m.TyreID,
		m.OldBatterySerial, m.NewBatterySerial, m.OldTyreSerial, m.NewTyreSerial,
		tenantID, id,
	).Scan(&m.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &m, nil
}

// Delete removes a maintenance record.
func (r *Repository) Delete(ctx context.Context, tenantID, id string) (bool, error) {
	query := `DELETE FROM maintenance WHERE tenant_id = $1 AND id = $2`
	res, err := r.pool.Exec(ctx, query, tenantID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}

func (r *Repository) GetLatestSerials(ctx context.Context, tenantID, vehicleIdentifier string) (*LatestSerialsResponse, error) {
	query := `
		SELECT 
			COALESCE((SELECT new_battery_serial FROM maintenance WHERE tenant_id = $1 AND (LOWER(vehicle_number) = LOWER($2) OR vehicle_id::text = $2) AND new_battery_serial != '' ORDER BY maintenance_date DESC, created_at DESC LIMIT 1), ''),
			COALESCE((SELECT new_tyre_serial FROM maintenance WHERE tenant_id = $1 AND (LOWER(vehicle_number) = LOWER($2) OR vehicle_id::text = $2) AND new_tyre_serial != '' ORDER BY maintenance_date DESC, created_at DESC LIMIT 1), '')
	`
	var resp LatestSerialsResponse
	err := r.pool.QueryRow(ctx, query, tenantID, vehicleIdentifier).Scan(&resp.LatestBatterySerial, &resp.LatestTyreSerial)
	if err != nil {
		return &LatestSerialsResponse{LatestBatterySerial: "", LatestTyreSerial: ""}, nil
	}
	return &resp, nil
}