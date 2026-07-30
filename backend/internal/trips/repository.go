package trips

import (
	"context"
	"database/sql"
	"errors"
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

// GetPaymentsForTrip returns all payment records for a given trip ordered by payment_date ASC.
func (r *Repository) GetPaymentsForTrip(ctx context.Context, tenantID, tripID string) ([]TripPayment, error) {
	query := `
		SELECT id, tenant_id, trip_id, amount, payment_type, COALESCE(payment_mode, 'Bank Transfer') as payment_mode, COALESCE(notes, '') as notes, payment_date, created_at
		FROM trip_payments
		WHERE tenant_id = $1 AND trip_id = $2
		ORDER BY payment_date ASC
	`
	rows, err := r.pool.Query(ctx, query, tenantID, tripID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []TripPayment
	for rows.Next() {
		var p TripPayment
		err := rows.Scan(&p.ID, &p.TenantID, &p.TripID, &p.Amount, &p.PaymentType, &p.PaymentMode, &p.Notes, &p.PaymentDate, &p.CreatedAt)
		if err != nil {
			return nil, err
		}
		payments = append(payments, p)
	}
	return payments, nil
}

// GetAll returns all trips for the given tenant with resolved names and payment history.
func (r *Repository) GetAll(ctx context.Context, tenantID string) ([]Trip, error) {
	query := `
		SELECT id, tenant_id, status, origin_name, origin_date, destination_name, destination_date, is_estimated,
		       material, weight, company_id, vehicle_id, driver_id, total_freight, advance_paid, rate_per_ton, created_at, updated_at
		FROM trips
		WHERE tenant_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Trip
	for rows.Next() {
		var t Trip
		var companyID, vehicleID, driverID sql.NullString
		err := rows.Scan(
			&t.ID, &t.TenantID, &t.Status, &t.OriginName, &t.OriginDate, &t.DestinationName, &t.DestinationDate, &t.IsEstimated,
			&t.Material, &t.Weight, &companyID, &vehicleID, &driverID, &t.TotalFreight, &t.AdvancePaid, &t.RatePerTon, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		t.CompanyID = companyID
		t.VehicleID = vehicleID
		t.DriverID = driverID

		// Fetch payment timeline
		pmts, _ := r.GetPaymentsForTrip(ctx, tenantID, t.ID)
		if pmts == nil {
			pmts = []TripPayment{}
		}
		t.Payments = pmts

		list = append(list, t)
	}

	return list, nil
}

// GetByID returns a single trip by ID, scoped to the tenant.
func (r *Repository) GetByID(ctx context.Context, tenantID, id string) (*Trip, error) {
	query := `
		SELECT id, tenant_id, status, origin_name, origin_date, destination_name, destination_date, is_estimated,
		       material, weight, company_id, vehicle_id, driver_id, total_freight, advance_paid, rate_per_ton, created_at, updated_at
		FROM trips
		WHERE tenant_id = $1 AND id = $2
	`
	var t Trip
	var companyID, vehicleID, driverID sql.NullString
	err := r.pool.QueryRow(ctx, query, tenantID, id).Scan(
		&t.ID, &t.TenantID, &t.Status, &t.OriginName, &t.OriginDate, &t.DestinationName, &t.DestinationDate, &t.IsEstimated,
		&t.Material, &t.Weight, &companyID, &vehicleID, &driverID, &t.TotalFreight, &t.AdvancePaid, &t.RatePerTon, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	t.CompanyID = companyID
	t.VehicleID = vehicleID
	t.DriverID = driverID

	pmts, _ := r.GetPaymentsForTrip(ctx, tenantID, t.ID)
	if pmts == nil {
		pmts = []TripPayment{}
	}
	t.Payments = pmts

	return &t, nil
}

// Create inserts a new trip and records an initial advance payment if specified.
func (r *Repository) Create(ctx context.Context, tenantID string, t *Trip) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO trips (
			tenant_id, status, origin_name, origin_date, destination_name, destination_date, is_estimated,
			material, weight, company_id, vehicle_id, driver_id, total_freight, advance_paid, rate_per_ton
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id, created_at, updated_at
	`
	var companyID, vehicleID, driverID interface{}
	if t.CompanyID.Valid {
		companyID = t.CompanyID.String
	}
	if t.VehicleID.Valid {
		vehicleID = t.VehicleID.String
	}
	if t.DriverID.Valid {
		driverID = t.DriverID.String
	}

	err = tx.QueryRow(ctx, query,
		tenantID, t.Status, t.OriginName, t.OriginDate, t.DestinationName, t.DestinationDate, t.IsEstimated,
		t.Material, t.Weight, companyID, vehicleID, driverID, t.TotalFreight, t.AdvancePaid, t.RatePerTon,
	).Scan(&t.ID, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return err
	}

	// Insert initial advance payment record if advance_paid > 0
	if t.AdvancePaid > 0 {
		queryPayment := `
			INSERT INTO trip_payments (tenant_id, trip_id, amount, payment_type, payment_mode, notes, payment_date)
			VALUES ($1, $2, $3, 'advance', 'Bank Transfer', 'Initial Advance Payment upon Dispatch', $4)
		`
		_, err = tx.Exec(ctx, queryPayment, tenantID, t.ID, t.AdvancePaid, t.OriginDate)
		if err != nil {
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	// Attach payment list
	pmts, _ := r.GetPaymentsForTrip(ctx, tenantID, t.ID)
	if pmts == nil {
		pmts = []TripPayment{}
	}
	t.Payments = pmts

	return nil
}

// AddPayment inserts a new installment or settlement payment, recalculating total advance_paid on the trip.
func (r *Repository) AddPayment(ctx context.Context, tenantID, tripID string, p *TripPayment) (*Trip, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// Verify trip exists
	var currentAdvance, totalFreight float64
	err = tx.QueryRow(ctx, `SELECT advance_paid, total_freight FROM trips WHERE tenant_id = $1 AND id = $2`, tenantID, tripID).Scan(&currentAdvance, &totalFreight)
	if err != nil {
		return nil, err
	}

	pType := "installment"
	if p.PaymentType != "" {
		pType = p.PaymentType
	} else if currentAdvance+p.Amount >= totalFreight {
		pType = "final_settlement"
	}

	pMode := "Bank Transfer"
	if p.PaymentMode != "" {
		pMode = p.PaymentMode
	}

	pDate := p.PaymentDate
	if pDate.IsZero() {
		pDate = time.Now()
	}

	queryInsert := `
		INSERT INTO trip_payments (tenant_id, trip_id, amount, payment_type, payment_mode, notes, payment_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`
	err = tx.QueryRow(ctx, queryInsert, tenantID, tripID, p.Amount, pType, pMode, p.Notes, pDate).Scan(&p.ID, &p.CreatedAt)
	if err != nil {
		return nil, err
	}

	// Update advance_paid on trip to match sum of all payments
	queryUpdateTrip := `
		UPDATE trips
		SET advance_paid = (SELECT COALESCE(SUM(amount), 0) FROM trip_payments WHERE trip_id = $1),
		    updated_at = NOW()
		WHERE tenant_id = $2 AND id = $1
	`
	_, err = tx.Exec(ctx, queryUpdateTrip, tripID, tenantID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	// Fetch updated trip
	return r.GetByID(ctx, tenantID, tripID)
}

// Update updates an existing trip.
func (r *Repository) Update(ctx context.Context, tenantID, id string, updateFn func(*Trip) error) (*Trip, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	querySelect := `
		SELECT id, tenant_id, status, origin_name, origin_date, destination_name, destination_date, is_estimated,
		       material, weight, company_id, vehicle_id, driver_id, total_freight, advance_paid, rate_per_ton, created_at, updated_at
		FROM trips
		WHERE tenant_id = $1 AND id = $2
	`
	var t Trip
	var companyID, vehicleID, driverID sql.NullString
	err = tx.QueryRow(ctx, querySelect, tenantID, id).Scan(
		&t.ID, &t.TenantID, &t.Status, &t.OriginName, &t.OriginDate, &t.DestinationName, &t.DestinationDate, &t.IsEstimated,
		&t.Material, &t.Weight, &companyID, &vehicleID, &driverID, &t.TotalFreight, &t.AdvancePaid, &t.RatePerTon, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	t.CompanyID = companyID
	t.VehicleID = vehicleID
	t.DriverID = driverID

	if err := updateFn(&t); err != nil {
		return nil, err
	}

	var dbCompanyID, dbVehicleID, dbDriverID interface{}
	if t.CompanyID.Valid {
		dbCompanyID = t.CompanyID.String
	}
	if t.VehicleID.Valid {
		dbVehicleID = t.VehicleID.String
	}
	if t.DriverID.Valid {
		dbDriverID = t.DriverID.String
	}

	queryUpdate := `
		UPDATE trips
		SET status = $1, origin_name = $2, origin_date = $3, destination_name = $4, destination_date = $5, is_estimated = $6,
		    material = $7, weight = $8, company_id = $9, vehicle_id = $10, driver_id = $11, total_freight = $12, advance_paid = $13, rate_per_ton = $14, updated_at = NOW()
		WHERE tenant_id = $15 AND id = $16
		RETURNING updated_at
	`
	err = tx.QueryRow(ctx, queryUpdate,
		t.Status, t.OriginName, t.OriginDate, t.DestinationName, t.DestinationDate, t.IsEstimated,
		t.Material, t.Weight, dbCompanyID, dbVehicleID, dbDriverID, t.TotalFreight, t.AdvancePaid, t.RatePerTon,
		tenantID, id,
	).Scan(&t.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &t, nil
}

// Delete removes a trip.
func (r *Repository) Delete(ctx context.Context, tenantID, id string) (bool, error) {
	query := `DELETE FROM trips WHERE tenant_id = $1 AND id = $2`
	res, err := r.pool.Exec(ctx, query, tenantID, id)
	if err != nil {
		return false, err
	}
	return res.RowsAffected() > 0, nil
}

// LookupCompanyID tries to find a company by name for the given tenant.
func (r *Repository) LookupCompanyID(ctx context.Context, tenantID, name string) (string, error) {
	var id string
	query := `SELECT id FROM companies WHERE tenant_id = $1 AND name ILIKE $2 LIMIT 1`
	err := r.pool.QueryRow(ctx, query, tenantID, name).Scan(&id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return id, nil
}

// CreateStubCompany creates a stub company with the given name.
func (r *Repository) CreateStubCompany(ctx context.Context, tenantID, name string) (string, error) {
	var id string
	query := `
		INSERT INTO companies (tenant_id, name, status, location, contact_person, phone, email, total_value, is_paid, pending_amount, industry)
		VALUES ($1, $2, 'Standard Account', 'Unknown', 'Unknown', '', '', 0, true, 0, 'Logistics')
		RETURNING id
	`
	err := r.pool.QueryRow(ctx, query, tenantID, name).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

// LookupVehicleID tries to find a vehicle by registration number (ignoring spaces).
func (r *Repository) LookupVehicleID(ctx context.Context, tenantID, regNum string) (string, error) {
	var id string
	query := `SELECT id FROM vehicles WHERE tenant_id = $1 AND REPLACE(registration_number, ' ', '') ILIKE REPLACE($2, ' ', '') LIMIT 1`
	err := r.pool.QueryRow(ctx, query, tenantID, regNum).Scan(&id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return id, nil
}

// LookupDriverID tries to find a driver by name.
func (r *Repository) LookupDriverID(ctx context.Context, tenantID, name string) (string, error) {
	var id string
	query := `SELECT id FROM drivers WHERE tenant_id = $1 AND name ILIKE $2 LIMIT 1`
	err := r.pool.QueryRow(ctx, query, tenantID, name).Scan(&id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return id, nil
}

// LookupCompanyName fetches the company name by ID.
func (r *Repository) LookupCompanyName(ctx context.Context, id string) (string, error) {
	var name string
	query := `SELECT name FROM companies WHERE id = $1`
	err := r.pool.QueryRow(ctx, query, id).Scan(&name)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return name, nil
}

// LookupVehicleRegNum fetches the vehicle registration number by ID.
func (r *Repository) LookupVehicleRegNum(ctx context.Context, id string) (string, error) {
	var regNum string
	query := `SELECT registration_number FROM vehicles WHERE id = $1`
	err := r.pool.QueryRow(ctx, query, id).Scan(&regNum)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return regNum, nil
}

// LookupDriverName fetches the driver name by ID.
func (r *Repository) LookupDriverName(ctx context.Context, id string) (string, error) {
	var name string
	query := `SELECT name FROM drivers WHERE id = $1`
	err := r.pool.QueryRow(ctx, query, id).Scan(&name)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return name, nil
}