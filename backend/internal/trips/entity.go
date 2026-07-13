package trips

import (
	"database/sql"
	"time"
)

// Trip represents a trip record in the database.
type Trip struct {
	ID              string         `json:"id" db:"id"`
	TenantID        string         `json:"tenantId" db:"tenant_id"`
	Status          string         `json:"status" db:"status"` // pending, in-transit, delivered
	OriginName      string         `json:"originName" db:"origin_name"`
	OriginDate      time.Time      `json:"originDate" db:"origin_date"`
	DestinationName string         `json:"destinationName" db:"destination_name"`
	DestinationDate time.Time      `json:"destinationDate" db:"destination_date"`
	IsEstimated     bool           `json:"isEstimated" db:"is_estimated"`
	Material        string         `json:"material" db:"material"`
	Weight          float64        `json:"weight" db:"weight"`
	CompanyID       sql.NullString `json:"companyId" db:"company_id"`
	VehicleID       sql.NullString `json:"vehicleId" db:"vehicle_id"`
	DriverID        sql.NullString `json:"driverId" db:"driver_id"`
	TotalFreight    float64        `json:"totalFreight" db:"total_freight"`
	AdvancePaid     float64        `json:"advancePaid" db:"advance_paid"`
	CreatedAt       time.Time      `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time      `json:"updatedAt" db:"updated_at"`
}