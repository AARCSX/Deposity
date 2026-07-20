package vehicles

import (
	"context"
)

// CreateFuel inserts a new fuel log entry.
func (r *Repository) CreateFuel(ctx context.Context, tenantID, vehicleID string, log *FuelLog) error {
	query := `
		INSERT INTO fuel_logs (tenant_id, vehicle_id, fuel_type, timestamp, litres, total_price, price_per_litre, station_name)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		tenantID, vehicleID, log.FuelType, log.Timestamp, log.Litres, log.TotalPrice, log.PricePerLitre, log.StationName,
	).Scan(&log.ID, &log.CreatedAt, &log.UpdatedAt)
}

// ListFuel retrieves all fuel logs for a vehicle.
func (r *Repository) ListFuel(ctx context.Context, tenantID, vehicleID string) ([]*FuelLog, error) {
	query := `
		SELECT id, tenant_id, vehicle_id, fuel_type, timestamp, litres, total_price, COALESCE(price_per_litre, 0), COALESCE(station_name, ''), created_at, updated_at
		FROM fuel_logs
		WHERE tenant_id = $1 AND vehicle_id = $2
		ORDER BY timestamp DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID, vehicleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []*FuelLog{}
	for rows.Next() {
		var log FuelLog
		err := rows.Scan(
			&log.ID, &log.TenantID, &log.VehicleID, &log.FuelType, &log.Timestamp, &log.Litres, &log.TotalPrice, &log.PricePerLitre, &log.StationName, &log.CreatedAt, &log.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, &log)
	}
	return list, nil
}

// DeleteFuel deletes a fuel log entry.
func (r *Repository) DeleteFuel(ctx context.Context, tenantID, vehicleID, id string) (bool, error) {
	query := `DELETE FROM fuel_logs WHERE tenant_id = $1 AND vehicle_id = $2 AND id = $3`
	res, err := r.pool.Exec(ctx, query, tenantID, vehicleID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
