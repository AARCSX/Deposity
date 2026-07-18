package vehicles

// CreateEMIRequest represents the payload to add a new EMI installment.
type CreateEMIRequest struct {
	InstallmentNo int     `json:"installmentNo" binding:"required"`
	DueDate       string  `json:"dueDate" binding:"required"`
	Amount        float64 `json:"amount" binding:"required"`
	Status        string  `json:"status"` // Defaults to Pending
	PaymentDate   *string `json:"paymentDate"`
	BankName      string  `json:"bankName"`
	ReferenceNo   string  `json:"referenceNo"`
}

// UpdateEMIRequest represents the payload to update an EMI installment.
type UpdateEMIRequest struct {
	InstallmentNo *int     `json:"installmentNo"`
	DueDate       *string  `json:"dueDate"`
	Amount        *float64 `json:"amount"`
	Status        *string  `json:"status"`
	PaymentDate   *string  `json:"paymentDate"`
	BankName      *string  `json:"bankName"`
	ReferenceNo   *string  `json:"referenceNo"`
}
