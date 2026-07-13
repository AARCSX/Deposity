package maintenance

import (
	"time"
)

// Maintenance represents a maintenance log record in the database.
type Maintenance struct {
	ID                  string    `json:"id" db:"id"`
	TenantID            string    `json:"tenantId" db:"tenant_id"`
	VehicleID           string    `json:"vehicleId" db:"vehicle_id"`
	VehicleNumber       string    `json:"vehicleNumber" db:"vehicle_number"`
	MaintenanceType     string    `json:"maintenanceType" db:"maintenance_type"`
	MaintenanceDate     time.Time `json:"maintenanceDate" db:"maintenance_date"`
	OdometerReading     int       `json:"odometerReading" db:"odometer_reading"`
	ServiceCenter       string    `json:"serviceCenter" db:"service_center"`
	Mechanic            string    `json:"mechanic" db:"mechanic"`
	Cost                float64   `json:"cost" db:"cost"`
	Description         string    `json:"description" db:"description"`
	PartsReplaced       string    `json:"partsReplaced" db:"parts_replaced"`
	NextServiceDate     time.Time `json:"nextServiceDate" db:"next_service_date"`
	NextServiceOdometer int       `json:"nextServiceOdometer" db:"next_service_odometer"`
	Status              string    `json:"status" db:"status"` // E.g., Completed, Scheduled
	Notes               string    `json:"notes" db:"notes"`
	CreatedAt           time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt           time.Time `json:"updatedAt" db:"updated_at"`
}