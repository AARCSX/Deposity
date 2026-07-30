package expenses

import (
	"time"
)

type Expense struct {
	ID            string    `json:"id" db:"id"`
	TenantID      string    `json:"tenantId" db:"tenant_id"`
	Category      string    `json:"category" db:"category"` // 'Salary', 'EMI', 'Fuel & Fleet', 'Office & Misc'
	Title         string    `json:"title" db:"title"`
	Amount        float64   `json:"amount" db:"amount"`
	ExpenseDate   time.Time `json:"expenseDate" db:"expense_date"`
	RecipientType string    `json:"recipientType" db:"recipient_type"` // 'driver', 'employee'
	RecipientID   string    `json:"recipientId" db:"recipient_id"`
	VehicleID     string    `json:"vehicleId" db:"vehicle_id"`
	PaymentMode   string    `json:"paymentMode" db:"payment_mode"`
	Notes         string    `json:"notes" db:"notes"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
}

type VehicleEMISummary struct {
	VehicleID          string    `json:"vehicleId"`
	VehicleNumber      string    `json:"vehicleNumber"`
	TotalLoanAmount    float64   `json:"totalLoanAmount"`
	TotalPaid          float64   `json:"totalPaid"`
	RemainingAmount    float64   `json:"remainingAmount"`
	MonthlyEMI         float64   `json:"monthlyEmi"`
	TotalInstallments  int       `json:"totalInstallments"`
	PaidInstallments   int       `json:"paidInstallments"`
	FinancingBank      string    `json:"financingBank"`
	NextDueDate        time.Time `json:"nextDueDate"`
}
