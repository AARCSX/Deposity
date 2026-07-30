package employees

import (
	"time"
)

type Employee struct {
	ID             string    `json:"id" db:"id"`
	TenantID       string    `json:"tenantId" db:"tenant_id"`
	Name           string    `json:"name" db:"name"`
	Role           string    `json:"role" db:"role"`
	Phone          string    `json:"phone" db:"phone"`
	Email          string    `json:"email" db:"email"`
	JoiningDate    time.Time `json:"joiningDate" db:"joining_date"`
	BaseSalary     float64   `json:"baseSalary" db:"base_salary"`
	PendingBalance float64   `json:"pendingBalance" db:"pending_balance"`
	Status         string    `json:"status" db:"status"` // Active, On Leave, Inactive
	Avatar         string    `json:"avatar" db:"avatar"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
}

type SalaryPayment struct {
	ID             string    `json:"id" db:"id"`
	TenantID       string    `json:"tenantId" db:"tenant_id"`
	RecipientType  string    `json:"recipientType" db:"recipient_type"` // driver, employee
	RecipientID    string    `json:"recipientId" db:"recipient_id"`
	AmountPaid     float64   `json:"amountPaid" db:"amount_paid"`
	PendingBalance float64   `json:"pendingBalance" db:"pending_balance"`
	PaymentMode    string    `json:"paymentMode" db:"payment_mode"`
	Notes          string    `json:"notes" db:"notes"`
	PaymentDate    time.Time `json:"paymentDate" db:"payment_date"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
}
