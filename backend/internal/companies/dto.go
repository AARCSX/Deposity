package companies

// CreateCompanyRequest represents the payload to create a new company.
type CreateCompanyRequest struct {
	Name          string  `json:"name" binding:"required"`
	Logo          string  `json:"logo"`
	Status        string  `json:"status"`
	Location      string  `json:"location"`
	ContactPerson string  `json:"contactPerson"`
	Phone         string  `json:"phone"`
	Email         string  `json:"email" binding:"omitempty,email"`
	TotalValue    float64 `json:"totalValue"`
	IsPaid        *bool   `json:"isPaid"` // Use pointer to distinguish between false and omission
	PendingAmount float64 `json:"pendingAmount"`
	Industry      string  `json:"industry"`
}

// UpdateCompanyRequest represents the payload to update an existing company.
type UpdateCompanyRequest struct {
	Name          *string  `json:"name"`
	Logo          *string  `json:"logo"`
	Status        *string  `json:"status"`
	Location      *string  `json:"location"`
	ContactPerson *string  `json:"contactPerson"`
	Phone         *string  `json:"phone"`
	Email         *string  `json:"email" binding:"omitempty,email"`
	TotalValue    *float64 `json:"totalValue"`
	IsPaid        *bool    `json:"isPaid"`
	PendingAmount *float64 `json:"pendingAmount"`
	Industry      *string  `json:"industry"`
}