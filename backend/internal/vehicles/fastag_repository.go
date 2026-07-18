package vehicles

import (
	"context"
)

// CreateFASTag inserts a new FASTag transaction record.
func (r *Repository) CreateFASTag(ctx context.Context, tenantID, vehicleID string, log *FASTagLog) error {
	query := `
		INSERT INTO fastag_logs (tenant_id, vehicle_id, transaction_id, timestamp, toll_plaza, amount, status, balance)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		tenantID, vehicleID, log.TransactionID, log.Timestamp, log.TollPlaza, log.Amount, log.Status, log.Balance,
	).Scan(&log.ID, &log.CreatedAt, &log.UpdatedAt)
}

// ListFASTag retrieves all FASTag logs for a vehicle.
func (r *Repository) ListFASTag(ctx context.Context, tenantID, vehicleID string) ([]*FASTagLog, error) {
	query := `
		SELECT id, tenant_id, vehicle_id, transaction_id, timestamp, toll_plaza, amount, status, balance, created_at, updated_at
		FROM fastag_logs
		WHERE tenant_id = $1 AND vehicle_id = $2
		ORDER BY timestamp DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID, vehicleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []*FASTagLog{}
	for rows.Next() {
		var log FASTagLog
		err := rows.Scan(
			&log.ID, &log.TenantID, &log.VehicleID, &log.TransactionID, &log.Timestamp, &log.TollPlaza, &log.Amount, &log.Status, &log.Balance, &log.CreatedAt, &log.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, &log)
	}
	return list, nil
}

// DeleteFASTag deletes a FASTag transaction record.
func (r *Repository) DeleteFASTag(ctx context.Context, tenantID, vehicleID, id string) (bool, error) {
	query := `DELETE FROM fastag_logs WHERE tenant_id = $1 AND vehicle_id = $2 AND id = $3`
	res, err := r.pool.Exec(ctx, query, tenantID, vehicleID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
