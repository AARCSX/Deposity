package maintenance

// MaintenanceResponse matches the frontend MaintenanceRecord.
type MaintenanceResponse struct {
	ID                  string  `json:"id"`
	VehicleID           string  `json:"vehicleId"`
	VehicleNumber       string  `json:"vehicleNumber"`
	MaintenanceType     string  `json:"maintenanceType"`
	MaintenanceDate     string  `json:"maintenanceDate"`
	OdometerReading     int     `json:"odometerReading"`
	ServiceCenter       string  `json:"serviceCenter"`
	Mechanic            string  `json:"mechanic"`
	Cost                float64 `json:"cost"`
	Description         string  `json:"description"`
	PartsReplaced       string  `json:"partsReplaced"`
	NextServiceDate     string  `json:"nextServiceDate"`
	NextServiceOdometer int     `json:"nextServiceOdometer"`
	Status              string  `json:"status"`
	Notes               string  `json:"notes"`
	TyreID              string  `json:"tyreId"`
}

// CreateMaintenanceRequest represents the payload to create a maintenance log.
type CreateMaintenanceRequest struct {
	VehicleID           string  `json:"vehicleId" binding:"required"`
	VehicleNumber       string  `json:"vehicleNumber" binding:"required"`
	MaintenanceType     string  `json:"maintenanceType" binding:"required"`
	MaintenanceDate     string  `json:"maintenanceDate" binding:"required"`
	OdometerReading     int     `json:"odometerReading"`
	ServiceCenter       string  `json:"serviceCenter"`
	Mechanic            string  `json:"mechanic"`
	Cost                float64 `json:"cost"`
	Description         string  `json:"description"`
	PartsReplaced       string  `json:"partsReplaced"`
	NextServiceDate     string  `json:"nextServiceDate"`
	NextServiceOdometer int     `json:"nextServiceOdometer"`
	Status              string  `json:"status"`
	Notes               string  `json:"notes"`
	TyreID              string  `json:"tyreId"`
}

// UpdateMaintenanceRequest represents the payload to update a maintenance log.
type UpdateMaintenanceRequest struct {
	VehicleID           *string  `json:"vehicleId"`
	VehicleNumber       *string  `json:"vehicleNumber"`
	MaintenanceType     *string  `json:"maintenanceType"`
	MaintenanceDate     *string  `json:"maintenanceDate"`
	OdometerReading     *int     `json:"odometerReading"`
	ServiceCenter       *string  `json:"serviceCenter"`
	Mechanic            *string  `json:"mechanic"`
	Cost                *float64 `json:"cost"`
	Description         *string  `json:"description"`
	PartsReplaced       *string  `json:"partsReplaced"`
	NextServiceDate     *string  `json:"nextServiceDate"`
	NextServiceOdometer *int     `json:"nextServiceOdometer"`
	Status              *string  `json:"status"`
	Notes               *string  `json:"notes"`
	TyreID              *string  `json:"tyreId"`
}