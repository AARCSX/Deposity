package employees

type EmployeeResponse struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Role           string  `json:"role"`
	Phone          string  `json:"phone"`
	Email          string  `json:"email"`
	JoiningDate    string  `json:"joiningDate"`
	BaseSalary     float64 `json:"baseSalary"`
	PendingBalance float64 `json:"pendingBalance"`
	Status         string  `json:"status"`
	Avatar         string  `json:"avatar"`
}

type CreateEmployeeRequest struct {
	Name           string  `json:"name" binding:"required"`
	Role           string  `json:"role" binding:"required"`
	Phone          string  `json:"phone" binding:"required"`
	Email          string  `json:"email"`
	JoiningDate    string  `json:"joiningDate"`
	BaseSalary     float64 `json:"baseSalary"`
	PendingBalance float64 `json:"pendingBalance"`
	Status         string  `json:"status"`
	Avatar         string  `json:"avatar"`
}

type UpdateEmployeeRequest struct {
	Name           *string  `json:"name"`
	Role           *string  `json:"role"`
	Phone          *string  `json:"phone"`
	Email          *string  `json:"email"`
	JoiningDate    *string  `json:"joiningDate"`
	BaseSalary     *float64 `json:"baseSalary"`
	PendingBalance *float64 `json:"pendingBalance"`
	Status         *string  `json:"status"`
	Avatar         *string  `json:"avatar"`
}

type SalaryPaymentResponse struct {
	ID             string  `json:"id"`
	RecipientType  string  `json:"recipientType"`
	RecipientID    string  `json:"recipientId"`
	AmountPaid     float64 `json:"amountPaid"`
	PendingBalance float64 `json:"pendingBalance"`
	PaymentMode    string  `json:"paymentMode"`
	Notes          string  `json:"notes"`
	PaymentDate    string  `json:"paymentDate"`
}
