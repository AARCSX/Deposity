package companies

import (
	"time"
)

// Company represents a company record in the database.
type Company struct {
	ID            string    `json:"id" db:"id"`
	TenantID      string    `json:"tenantId" db:"tenant_id"`
	Name          string    `json:"name" db:"name"`
	Logo          string    `json:"logo" db:"logo"`
	Status        string    `json:"status" db:"status"`
	Location      string    `json:"location" db:"location"`
	ContactPerson string    `json:"contactPerson" db:"contact_person"`
	Phone         string    `json:"phone" db:"phone"`
	Email         string    `json:"email" db:"email"`
	TotalValue    float64   `json:"totalValue" db:"total_value"`
	IsPaid        bool      `json:"isPaid" db:"is_paid"`
	PendingAmount float64   `json:"pendingAmount" db:"pending_amount"`
	Industry      string    `json:"industry" db:"industry"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt" db:"updated_at"`
}