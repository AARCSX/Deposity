package expenses

import (
	"context"
	"database/sql"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]Expense, error) {
	query := `
		SELECT id, tenant_id, category, title, amount, expense_date,
		       COALESCE(recipient_type, ''), COALESCE(recipient_id::text, ''), COALESCE(vehicle_id::text, ''),
		       COALESCE(payment_mode, 'Bank Transfer'), COALESCE(notes, ''), created_at
		FROM expenses
		WHERE tenant_id = $1
		ORDER BY expense_date DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Expense
	for rows.Next() {
		var e Expense
		err := rows.Scan(
			&e.ID, &e.TenantID, &e.Category, &e.Title, &e.Amount, &e.ExpenseDate,
			&e.RecipientType, &e.RecipientID, &e.VehicleID, &e.PaymentMode, &e.Notes, &e.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, e)
	}
	return list, nil
}

func (r *Repository) Create(ctx context.Context, tenantID string, e *Expense, pendingBalance float64, installmentNo int) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var recipientIDVal, vehicleIDVal interface{}
	if e.RecipientID != "" {
		recipientIDVal = e.RecipientID
	}
	if e.VehicleID != "" {
		vehicleIDVal = e.VehicleID
	}

	query := `
		INSERT INTO expenses (tenant_id, category, title, amount, expense_date, recipient_type, recipient_id, vehicle_id, payment_mode, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at
	`
	err = tx.QueryRow(ctx, query,
		tenantID, e.Category, e.Title, e.Amount, e.ExpenseDate, e.RecipientType, recipientIDVal, vehicleIDVal, e.PaymentMode, e.Notes,
	).Scan(&e.ID, &e.CreatedAt)
	if err != nil {
		return err
	}

	// If category == 'Salary', log in salary_payments & update recipient pending_balance
	if e.Category == "Salary" && e.RecipientID != "" {
		// Log salary_payments
		querySalaryPmt := `
			INSERT INTO salary_payments (tenant_id, recipient_type, recipient_id, amount_paid, pending_balance, payment_mode, notes, payment_date)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`
		_, err = tx.Exec(ctx, querySalaryPmt, tenantID, e.RecipientType, e.RecipientID, e.Amount, pendingBalance, e.PaymentMode, e.Notes, e.ExpenseDate)
		if err != nil {
			return err
		}

		// Update pending_balance in target table
		if e.RecipientType == "driver" {
			_, err = tx.Exec(ctx, `UPDATE drivers SET pending_balance = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`, pendingBalance, e.RecipientID, tenantID)
		} else if e.RecipientType == "employee" {
			_, err = tx.Exec(ctx, `UPDATE employees SET pending_balance = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`, pendingBalance, e.RecipientID, tenantID)
		}
		if err != nil {
			return err
		}
	}

	// If category == 'EMI' and vehicle_id set, mark matching emi_schedules row as Paid
	if e.Category == "EMI" && e.VehicleID != "" {
		if installmentNo > 0 {
			_, _ = tx.Exec(ctx, `
				UPDATE emi_schedules
				SET status = 'Paid', payment_date = $1, reference_no = $2
				WHERE vehicle_id = $3 AND installment_no = $4 AND tenant_id = $5
			`, e.ExpenseDate, e.Notes, e.VehicleID, installmentNo, tenantID)
		} else {
			_, _ = tx.Exec(ctx, `
				UPDATE emi_schedules
				SET status = 'Paid', payment_date = $1, reference_no = $2
				WHERE id = (
					SELECT id FROM emi_schedules 
					WHERE vehicle_id = $3 AND tenant_id = $4 AND status != 'Paid'
					ORDER BY installment_no ASC LIMIT 1
				)
			`, e.ExpenseDate, e.Notes, e.VehicleID, tenantID)
		}
	}

	return tx.Commit(ctx)
}

func (r *Repository) Delete(ctx context.Context, tenantID, id string) (bool, error) {
	query := `DELETE FROM expenses WHERE tenant_id = $1 AND id = $2`
	res, err := r.pool.Exec(ctx, query, tenantID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}

func (r *Repository) LookupRecipientName(ctx context.Context, recipientType, recipientID string) string {
	if recipientID == "" {
		return ""
	}
	var name string
	if recipientType == "driver" {
		_ = r.pool.QueryRow(ctx, `SELECT name FROM drivers WHERE id = $1::uuid`, recipientID).Scan(&name)
	} else if recipientType == "employee" {
		_ = r.pool.QueryRow(ctx, `SELECT name FROM employees WHERE id = $1::uuid`, recipientID).Scan(&name)
	}
	return name
}

func (r *Repository) LookupVehicleRegNum(ctx context.Context, vehicleID string) string {
	if vehicleID == "" {
		return ""
	}
	var reg string
	_ = r.pool.QueryRow(ctx, `SELECT registration_number FROM vehicles WHERE id = $1::uuid`, vehicleID).Scan(&reg)
	return reg
}

func (r *Repository) GetVehicleEMISummaries(ctx context.Context, tenantID string) ([]VehicleEMISummary, error) {
	query := `
		SELECT v.id::text, v.registration_number,
		       COALESCE(SUM(e.amount), 0) as total_loan,
		       COALESCE(SUM(CASE WHEN e.status = 'Paid' THEN e.amount ELSE 0 END), 0) as total_paid,
		       COUNT(e.id) as total_installments,
		       COUNT(CASE WHEN e.status = 'Paid' THEN 1 END) as paid_installments,
		       COALESCE(MAX(e.bank_name), 'Bank') as bank_name,
		       COALESCE(MIN(CASE WHEN e.status != 'Paid' THEN e.due_date END), NOW()) as next_due
		FROM vehicles v
		INNER JOIN emi_schedules e ON e.vehicle_id = v.id AND e.tenant_id = $1
		WHERE v.tenant_id = $1
		GROUP BY v.id, v.registration_number
		ORDER BY v.registration_number ASC
	`
	rows, err := r.pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []VehicleEMISummary
	for rows.Next() {
		var s VehicleEMISummary
		var bankName sql.NullString
		err := rows.Scan(
			&s.VehicleID, &s.VehicleNumber, &s.TotalLoanAmount, &s.TotalPaid,
			&s.TotalInstallments, &s.PaidInstallments, &bankName, &s.NextDueDate,
		)
		if err != nil {
			return nil, err
		}
		s.FinancingBank = bankName.String
		s.RemainingAmount = s.TotalLoanAmount - s.TotalPaid
		if s.TotalInstallments > 0 {
			s.MonthlyEMI = s.TotalLoanAmount / float64(s.TotalInstallments)
		}
		list = append(list, s)
	}

	return list, nil
}
