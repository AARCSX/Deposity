package vehicles

// CreateFASTagRequest represents the payload to register a FASTag toll entry.
type CreateFASTagRequest struct {
	TransactionID string  `json:"transactionId" binding:"required"`
	Timestamp     string  `json:"timestamp" binding:"required"`
	TollPlaza     string  `json:"tollPlaza" binding:"required"`
	Amount        float64 `json:"amount" binding:"required"`
	Status        string  `json:"status"` // Defaults to Debited
	Balance       float64 `json:"balance"`
}
