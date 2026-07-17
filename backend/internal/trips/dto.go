package trips

type RouteDetails struct {
	OriginName      string `json:"originName" binding:"required"`
	OriginDate      string `json:"originDate" binding:"required"` // Can be ISO or local format
	DestinationName string `json:"destinationName" binding:"required"`
	DestinationDate string `json:"destinationDate" binding:"required"`
	IsEstimated     bool   `json:"isEstimated"`
}

type CargoDetails struct {
	Material   string  `json:"material" binding:"required"`
	Weight     float64 `json:"weight" binding:"required"`
	RatePerTon float64 `json:"ratePerTon"`
	Company    string  `json:"company" binding:"required"` // Company Name
}

type AssignmentDetails struct {
	VehicleID string `json:"vehicleId" binding:"required"` // Vehicle Reg No.
	DriverID  string `json:"driverId" binding:"required"`  // Driver Name/Phone
}

type FinancialsDetails struct {
	TotalFreight float64 `json:"totalFreight"`
	AdvancePaid  float64 `json:"advancePaid"`
}

// TripResponse matches the frontend TripRecord.
type TripResponse struct {
	ID         string            `json:"id"`
	Status     string            `json:"status"` // pending, in-transit, delivered
	Route      RouteDetails      `json:"route"`
	Cargo      CargoDetails      `json:"cargo"`
	Assignment AssignmentDetails `json:"assignment"`
	Financials FinancialsDetails `json:"financials"`
}

// CreateTripRequest represents the payload to create a new trip.
type CreateTripRequest struct {
	Status     string            `json:"status" binding:"required"`
	Route      RouteDetails      `json:"route" binding:"required"`
	Cargo      CargoDetails      `json:"cargo" binding:"required"`
	Assignment AssignmentDetails `json:"assignment" binding:"required"`
	Financials FinancialsDetails `json:"financials"`
}

// UpdateTripRequest represents the payload to update a trip.
type UpdateTripRequest struct {
	Status     *string            `json:"status"`
	Route      *RouteDetails      `json:"route"`
	Cargo      *CargoDetails      `json:"cargo"`
	Assignment *AssignmentDetails `json:"assignment"`
	Financials *FinancialsDetails `json:"financials"`
}