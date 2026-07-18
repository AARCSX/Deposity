package vehicles

import (
	"time"
)

// FASTagLog represents a toll deduction log entry in the database.
type FASTagLog struct {
	ID            string    `json:"id" db:"id"`
	TenantID      string    `json:"tenantId" db:"tenant_id"`
	VehicleID     string    `json:"vehicleId" db:"vehicle_id"`
	TransactionID string    `json:"transactionId" db:"transaction_id"`
	Timestamp     time.Time `json:"timestamp" db:"timestamp"`
	TollPlaza     string    `json:"tollPlaza" db:"toll_plaza"`
	Amount        float64   `json:"amount" db:"amount"`
	Status        string    `json:"status" db:"status"` // Debited, Failed
	Balance       float64   `json:"balance" db:"balance"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt" db:"updated_at"`
}
