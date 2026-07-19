package vehicles

import "time"

type CoreSpecifications struct {
	RegistrationNumber string  `json:"registrationNumber" binding:"required"`
	Make               string  `json:"make" binding:"required"`
	Model              string  `json:"model" binding:"required"`
	Year               int     `json:"year" binding:"required"`
	BodyType           string  `json:"bodyType" binding:"required"`
	AxleConfig         string  `json:"axleConfig" binding:"required"`
	TonnageCapacity    float64 `json:"tonnageCapacity" binding:"required"`
	FuelCapacity       float64 `json:"fuelCapacity" binding:"required"`
	AverageMileage     float64 `json:"averageMileage" binding:"required"`
}

type ComplianceDocuments struct {
	RCExpiry          time.Time  `json:"rcExpiry" binding:"required"`
	RCIssuance        *time.Time `json:"rcIssuance"`
	InsuranceExpiry   time.Time  `json:"insuranceExpiry" binding:"required"`
	InsuranceIssuance *time.Time `json:"insuranceIssuance"`
	PUCExpiry         time.Time  `json:"pucExpiry" binding:"required"`
	PUCIssuance       *time.Time `json:"pucIssuance"`
	FitnessExpiry     time.Time  `json:"fitnessExpiry" binding:"required"`
	FitnessIssuance   *time.Time `json:"fitnessIssuance"`
	FASTagExpiry      *time.Time `json:"fastagExpiry"`
	FASTagIssuance    *time.Time `json:"fastagIssuance"`
	PermitDetails     string     `json:"permitDetails"`
}

type OwnershipStatus struct {
	OwnershipType string  `json:"ownershipType" binding:"required"` // E.g., Own, Market
	DriverID      *string `json:"driverId"`                      // Optional driver assignment
	DriverName    string  `json:"driverName,omitempty"`           // Resolved driver name
	DriverPhone   string  `json:"driverPhone,omitempty"`          // Resolved driver phone
	HomeBranch    string  `json:"homeBranch"`
	GPSDeviceID   string  `json:"gpsDeviceId"`
}

type MaintenanceData struct {
	CurrentOdometer  int       `json:"currentOdometer"`
	LastServicedDate time.Time `json:"lastServicedDate"`
}

// VehicleResponse matches the nested VehicleRecord in the frontend.
type VehicleResponse struct {
	ID          string              `json:"id"`
	Core        CoreSpecifications  `json:"core"`
	Compliance  ComplianceDocuments `json:"compliance"`
	Ownership   OwnershipStatus     `json:"ownership"`
	Maintenance MaintenanceData     `json:"maintenance"`
	Status      string              `json:"status"` // all-good, expiring-soon, expired-docs, maintenance
}

// CreateVehicleRequest represents the nested payload to create a new vehicle.
type CreateVehicleRequest struct {
	Core        CoreSpecifications  `json:"core" binding:"required"`
	Compliance  ComplianceDocuments `json:"compliance" binding:"required"`
	Ownership   OwnershipStatus     `json:"ownership" binding:"required"`
	Maintenance MaintenanceData     `json:"maintenance"`
	Status      string              `json:"status"`
}

// UpdateVehicleRequest represents the nested payload to update a vehicle.
type UpdateVehicleRequest struct {
	Core        *CoreSpecifications  `json:"core"`
	Compliance  *ComplianceDocuments `json:"compliance"`
	Ownership   *OwnershipStatus     `json:"ownership"`
	Maintenance *MaintenanceData     `json:"maintenance"`
	Status      *string              `json:"status"`
}