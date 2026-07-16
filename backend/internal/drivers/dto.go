package drivers

import "time"

// CreateDriverRequest represents the payload to register a new driver.
type CreateDriverRequest struct {
	Name            string    `json:"name" binding:"required"`
	Avatar          string    `json:"avatar"`
	Status          string    `json:"status"` // E.g., Active, Inactive, On Break
	Phone           string    `json:"phone" binding:"required"`
	VehicleID       *string   `json:"vehicleId"` // Optional vehicle assignment
	LicenseNumber   string    `json:"licenseNumber" binding:"required"`
	LicenseExpiry   time.Time  `json:"licenseExpiry" binding:"required"`
	LicenseIssuance *time.Time `json:"licenseIssuance"`
	Salary          float64    `json:"salary"`
	PendingBalance  float64   `json:"pendingBalance"`
	IsStatusWarning bool      `json:"isStatusWarning"`
}

// UpdateDriverRequest represents the payload to update a driver's details.
type UpdateDriverRequest struct {
	Name            *string    `json:"name"`
	Avatar          *string    `json:"avatar"`
	Status          *string    `json:"status"`
	Phone           *string    `json:"phone"`
	VehicleID       **string   `json:"vehicleId"` // Pointer to pointer to allow setting to null
	LicenseNumber   *string    `json:"licenseNumber"`
	LicenseExpiry   *time.Time `json:"licenseExpiry"`
	LicenseIssuance *time.Time `json:"licenseIssuance"`
	Salary          *float64   `json:"salary"`
	PendingBalance  *float64   `json:"pendingBalance"`
	IsStatusWarning *bool      `json:"isStatusWarning"`
}

// DriverResponse represents the formatted payload returned to the frontend.
type DriverResponse struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Avatar          string `json:"avatar"`
	Status          string `json:"status"`
	Phone           string `json:"phone"`
	Vehicle         string `json:"vehicle"` // Registration number
	VehicleID       string `json:"vehicleId,omitempty"`
	LicenseNumber   string `json:"licenseNumber"`
	LicenseExpiry   string `json:"licenseExpiry"` // Formatted date
	LicenseIssuance string `json:"licenseIssuance,omitempty"`
	Salary          string `json:"salary"`        // Formatted salary, e.g., ₹25,000
	PendingBalance  string `json:"pendingBalance"` // Formatted balance, e.g., ₹1,240
	IsStatusWarning bool   `json:"isStatusWarning"`
}