package vehicles

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
)

// CreateEMI inserts a new EMI schedule entry.
func (r *Repository) CreateEMI(ctx context.Context, tenantID, vehicleID string, emi *EMISchedule) error {
	query := `
		INSERT INTO emi_schedules (tenant_id, vehicle_id, installment_no, due_date, amount, status, payment_date, bank_name, reference_no)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		tenantID, vehicleID, emi.InstallmentNo, emi.DueDate, emi.Amount, emi.Status, emi.PaymentDate, emi.BankName, emi.ReferenceNo,
	).Scan(&emi.ID, &emi.CreatedAt, &emi.UpdatedAt)
}

// GetEMI retrieves a specific EMI schedule entry by ID.
func (r *Repository) GetEMI(ctx context.Context, tenantID, vehicleID, id string) (*EMISchedule, error) {
	query := `
		SELECT id, tenant_id, vehicle_id, installment_no, due_date, amount, status, payment_date, bank_name, reference_no, created_at, updated_at
		FROM emi_schedules
		WHERE tenant_id = $1 AND vehicle_id = $2 AND id = $3
	`
	var emi EMISchedule
	err := r.pool.QueryRow(ctx, query, tenantID, vehicleID, id).Scan(
		&emi.ID, &emi.TenantID, &emi.VehicleID, &emi.InstallmentNo, &emi.DueDate, &emi.Amount, &emi.Status, &emi.PaymentDate, &emi.BankName, &emi.ReferenceNo, &emi.CreatedAt, &emi.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &emi, nil
}

// ListEMI retrieves all EMI schedules for a given vehicle.
func (r *Repository) ListEMI(ctx context.Context, tenantID, vehicleID string) ([]*EMISchedule, error) {
	query := `
		SELECT id, tenant_id, vehicle_id, installment_no, due_date, amount, status, payment_date, bank_name, reference_no, created_at, updated_at
		FROM emi_schedules
		WHERE tenant_id = $1 AND vehicle_id = $2
		ORDER BY installment_no ASC, due_date ASC
	`
	rows, err := r.pool.Query(ctx, query, tenantID, vehicleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []*EMISchedule{}
	for rows.Next() {
		var emi EMISchedule
		err := rows.Scan(
			&emi.ID, &emi.TenantID, &emi.VehicleID, &emi.InstallmentNo, &emi.DueDate, &emi.Amount, &emi.Status, &emi.PaymentDate, &emi.BankName, &emi.ReferenceNo, &emi.CreatedAt, &emi.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, &emi)
	}
	return list, nil
}

// UpdateEMI updates an existing EMI schedule entry.
func (r *Repository) UpdateEMI(ctx context.Context, tenantID, vehicleID, id string, emi *EMISchedule) error {
	query := `
		UPDATE emi_schedules
		SET installment_no = $1, due_date = $2, amount = $3, status = $4, payment_date = $5, bank_name = $6, reference_no = $7, updated_at = NOW()
		WHERE tenant_id = $8 AND vehicle_id = $9 AND id = $10
		RETURNING updated_at
	`
	return r.pool.QueryRow(ctx, query,
		emi.InstallmentNo, emi.DueDate, emi.Amount, emi.Status, emi.PaymentDate, emi.BankName, emi.ReferenceNo,
		tenantID, vehicleID, id,
	).Scan(&emi.UpdatedAt)
}

// DeleteEMI removes a specific EMI schedule entry.
func (r *Repository) DeleteEMI(ctx context.Context, tenantID, vehicleID, id string) (bool, error) {
	query := `DELETE FROM emi_schedules WHERE tenant_id = $1 AND vehicle_id = $2 AND id = $3`
	res, err := r.pool.Exec(ctx, query, tenantID, vehicleID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}
