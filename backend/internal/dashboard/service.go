package dashboard

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	pool *pgxpool.Pool
}

func NewService(pool *pgxpool.Pool) *Service {
	return &Service{pool: pool}
}

// GetStats runs cross-table SQL aggregation queries for the dashboard.
func (s *Service) GetStats(ctx context.Context, tenantID string) (*DashboardStats, error) {
	var stats DashboardStats

	// 1. Total Vehicles
	err := s.pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM vehicles WHERE tenant_id = $1",
		tenantID,
	).Scan(&stats.TotalVehicles)
	if err != nil {
		return nil, err
	}

	// 2. Active Trips
	err = s.pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM trips WHERE tenant_id = $1 AND status = 'in-transit'",
		tenantID,
	).Scan(&stats.ActiveTrips)
	if err != nil {
		return nil, err
	}

	// 3. Unique Drivers
	err = s.pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM drivers WHERE tenant_id = $1",
		tenantID,
	).Scan(&stats.UniqueDrivers)
	if err != nil {
		return nil, err
	}

	// 4. Available Drivers
	// Total drivers minus the drivers currently assigned to active (in-transit) trips
	err = s.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM drivers 
		 WHERE tenant_id = $1 
		   AND id NOT IN (
		       SELECT (driver_id::uuid) FROM trips 
		       WHERE tenant_id = $1 AND status = 'in-transit' AND driver_id IS NOT NULL AND driver_id <> ''
		   )`,
		tenantID,
	).Scan(&stats.AvailableDrivers)
	if err != nil {
		// Fallback to active calculation if driver_id conversion fails
		stats.AvailableDrivers = stats.UniqueDrivers - stats.ActiveTrips
		if stats.AvailableDrivers < 0 {
			stats.AvailableDrivers = 0
		}
	}

	// 5. Total Revenue (Freight)
	err = s.pool.QueryRow(ctx,
		"SELECT COALESCE(SUM(total_freight), 0) FROM trips WHERE tenant_id = $1",
		tenantID,
	).Scan(&stats.TotalRevenue)
	if err != nil {
		return nil, err
	}

	// Format revenue string
	if stats.TotalRevenue >= 100000 {
		stats.FormattedRevenue = fmt.Sprintf("₹%.1fL", stats.TotalRevenue/100000.0)
	} else {
		stats.FormattedRevenue = fmt.Sprintf("₹%.0fK", stats.TotalRevenue/1000.0)
	}

	// 6. Expiring Compliance (RC, Insurance, PUC, or Fitness expiring within 30 days)
	err = s.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM vehicles 
		 WHERE tenant_id = $1 
		   AND (rc_expiry < NOW() + INTERVAL '30 days' 
		     OR insurance_expiry < NOW() + INTERVAL '30 days' 
		     OR puc_expiry < NOW() + INTERVAL '30 days' 
		     OR fitness_expiry < NOW() + INTERVAL '30 days')`,
		tenantID,
	).Scan(&stats.ExpiringCompliance)
	if err != nil {
		return nil, err
	}

	// 7. Overdue/Pending Maintenance
	err = s.pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM maintenance WHERE tenant_id = $1 AND status != 'Completed'",
		tenantID,
	).Scan(&stats.PendingMaintenance)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}