package vehicles

import "time"

// FuelLog represents a fuel/urea expense log for a vehicle.
type FuelLog struct {
	ID            string    `json:"id" db:"id"`
	TenantID      string    `json:"tenantId" db:"tenant_id"`
	VehicleID     string    `json:"vehicleId" db:"vehicle_id"`
	FuelType      string    `json:"fuelType" db:"fuel_type"` // Diesel or Urea
	Timestamp     time.Time `json:"timestamp" db:"timestamp"`
	Litres        float64   `json:"litres" db:"litres"`
	TotalPrice    float64   `json:"totalPrice" db:"total_price"`
	PricePerLitre float64   `json:"pricePerLitre" db:"price_per_litre"`
	StationName   string    `json:"stationName" db:"station_name"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt" db:"updated_at"`
}

// CreateFuelRequest represents the payload to add a fuel entry.
type CreateFuelRequest struct {
	FuelType      string  `json:"fuelType" binding:"required"`
	Timestamp     string  `json:"timestamp" binding:"required"`
	Litres        float64 `json:"litres" binding:"required"`
	TotalPrice    float64 `json:"totalPrice" binding:"required"`
	PricePerLitre float64 `json:"pricePerLitre"`
	StationName   string  `json:"stationName"`
}
