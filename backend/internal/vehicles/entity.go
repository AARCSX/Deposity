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
	RCIssuance         *time.Time     `json:"rcIssuance" db:"rc_issuance"`
	InsuranceExpiry    time.Time      `json:"insuranceExpiry" db:"insurance_expiry"`
	InsuranceIssuance  *time.Time     `json:"insuranceIssuance" db:"insurance_issuance"`
	PUCExpiry          time.Time      `json:"pucExpiry" db:"puc_expiry"`
	PUCIssuance        *time.Time     `json:"pucIssuance" db:"puc_issuance"`
	FitnessExpiry      time.Time      `json:"fitnessExpiry" db:"fitness_expiry"`
	FitnessIssuance    *time.Time     `json:"fitnessIssuance" db:"fitness_issuance"`
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

	// Transient fields populated via JOIN, not stored in DB.
	DriverName  string `json:"-" db:"-"`
	DriverPhone string `json:"-" db:"-"`
}