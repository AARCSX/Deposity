package vehicles

import (
	"time"
)

// EMISchedule represents an EMI schedule installment record in the database.
type EMISchedule struct {
	ID            string     `json:"id" db:"id"`
	TenantID      string     `json:"tenantId" db:"tenant_id"`
	VehicleID     string     `json:"vehicleId" db:"vehicle_id"`
	InstallmentNo int        `json:"installmentNo" db:"installment_no"`
	DueDate       time.Time  `json:"dueDate" db:"due_date"`
	Amount        float64    `json:"amount" db:"amount"`
	Status        string     `json:"status" db:"status"` // Pending, Paid, Overdue
	PaymentDate   *time.Time `json:"paymentDate" db:"payment_date"`
	BankName      string     `json:"bankName" db:"bank_name"`
	ReferenceNo   string     `json:"referenceNo" db:"reference_no"`
	CreatedAt     time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time  `json:"updatedAt" db:"updated_at"`
}
