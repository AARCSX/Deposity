package vehicles

import (
	"database/sql"
	"time"
)

// Vehicle represents a vehicle record in the database.
type Vehicle struct {
	ID                 string         `json:"id" db:"id"`
	TenantID           string         `json:"tenantId" db:"tenant_id"`
	RegistrationNumber string         `json:"registrationNumber" db:"registration_number"`
	Make               string         `json:"make" db:"make"`
	Model              string         `json:"model" db:"model"`
	Year               int            `json:"year" db:"year"`
	BodyType           string         `json:"bodyType" db:"body_type"`
	AxleConfig         string         `json:"axleConfig" db:"axle_config"`
	TonnageCapacity    float64        `json:"tonnageCapacity" db:"tonnage_capacity"`
	FuelCapacity       float64        `json:"fuelCapacity" db:"fuel_capacity"`
	AverageMileage     float64        `json:"averageMileage" db:"average_mileage"`
	RCExpiry           time.Time      `json:"rcExpiry" db:"rc_expiry"`
	InsuranceExpiry    time.Time      `json:"insuranceExpiry" db:"insurance_expiry"`
	PUCExpiry          time.Time      `json:"pucExpiry" db:"puc_expiry"`
	FitnessExpiry      time.Time      `json:"fitnessExpiry" db:"fitness_expiry"`
	PermitDetails      string         `json:"permitDetails" db:"permit_details"`
	OwnershipType      string         `json:"ownershipType" db:"ownership_type"`
	DriverID           sql.NullString `json:"driverId" db:"driver_id"`
	HomeBranch         string         `json:"homeBranch" db:"home_branch"`
	GPSDeviceID        string         `json:"gpsDeviceId" db:"gps_device_id"`
	CurrentOdometer    int            `json:"currentOdometer" db:"current_odometer"`
	LastServicedDate   time.Time      `json:"lastServicedDate" db:"last_serviced_date"`
	Status             string         `json:"status" db:"status"`
	CreatedAt          time.Time      `json:"createdAt" db:"created_at"`
	UpdatedAt          time.Time      `json:"updatedAt" db:"updated_at"`
}