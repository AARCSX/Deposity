package expenses

type ExpenseResponse struct {
	ID            string  `json:"id"`
	Category      string  `json:"category"`
	Title         string  `json:"title"`
	Amount        float64 `json:"amount"`
	ExpenseDate   string  `json:"expenseDate"`
	RecipientType string  `json:"recipientType"`
	RecipientID   string  `json:"recipientId"`
	RecipientName string  `json:"recipientName"`
	VehicleID     string  `json:"vehicleId"`
	VehicleNumber string  `json:"vehicleNumber"`
	PaymentMode   string  `json:"paymentMode"`
	Notes         string  `json:"notes"`
	CreatedAt     string  `json:"createdAt"`
}

type CreateExpenseRequest struct {
	Category       string  `json:"category" binding:"required"` // 'Salary', 'EMI', 'Fuel & Fleet', 'Office & Misc'
	Title          string  `json:"title"`
	Amount         float64 `json:"amount" binding:"required"`
	ExpenseDate    string  `json:"expenseDate"`
	RecipientType  string  `json:"recipientType"` // 'driver', 'employee'
	RecipientID    string  `json:"recipientId"`
	PendingBalance float64 `json:"pendingBalance"` // for Salary payments, updates recipient's pending balance
	VehicleID      string  `json:"vehicleId"`
	InstallmentNo  int     `json:"installmentNo"`
	PaymentMode    string  `json:"paymentMode"`
	Notes          string  `json:"notes"`
}
