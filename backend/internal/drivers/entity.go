package drivers

import (
	"database/sql"
	"time"
)

// Driver represents a driver record in the database.
type Driver struct {
	ID              string         `json:"id" db:"id"`
	TenantID        string         `json:"tenantId" db:"tenant_id"`
	Name            string         `json:"name" db:"name"`
	Avatar          string         `json:"avatar" db:"avatar"`
	Status          string         `json:"status" db:"status"`
	Phone           string         `json:"phone" db:"phone"`
	VehicleID       sql.NullString `json:"vehicleId" db:"vehicle_id"`
	LicenseNumber   string         `json:"licenseNumber" db:"license_number"`
	LicenseExpiry   time.Time      `json:"licenseExpiry" db:"license_expiry"`
	Salary          float64        `json:"salary" db:"salary"`
	PendingBalance  float64        `json:"pendingBalance" db:"pending_balance"`
	IsStatusWarning bool           `json:"isStatusWarning" db:"is_status_warning"`
	CreatedAt       time.Time      `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time      `json:"updatedAt" db:"updated_at"`
}