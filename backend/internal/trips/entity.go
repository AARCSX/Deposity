package trips

import (
	"database/sql"
	"time"
)

// TripPayment represents an individual payment installment recorded against a trip.
type TripPayment struct {
	ID          string    `json:"id" db:"id"`
	TenantID    string    `json:"tenantId" db:"tenant_id"`
	TripID      string    `json:"tripId" db:"trip_id"`
	Amount      float64   `json:"amount" db:"amount"`
	PaymentType string    `json:"paymentType" db:"payment_type"`
	PaymentMode string    `json:"paymentMode" db:"payment_mode"`
	Notes       string    `json:"notes" db:"notes"`
	PaymentDate time.Time `json:"paymentDate" db:"payment_date"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

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
	RatePerTon      float64        `json:"ratePerTon" db:"rate_per_ton"`
	CreatedAt       time.Time      `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time      `json:"updatedAt" db:"updated_at"`
	Payments        []TripPayment  `json:"payments"`
}