package dashboard

// DashboardStats represents the aggregated statistics for the dashboard.
type DashboardStats struct {
	TotalVehicles       int64   `json:"totalVehicles"`
	ActiveTrips         int64   `json:"activeTrips"`
	UniqueDrivers       int64   `json:"uniqueDrivers"`
	AvailableDrivers    int64   `json:"availableDrivers"`
	TotalRevenue        float64 `json:"totalRevenue"`
	FormattedRevenue    string  `json:"formattedRevenue"`
	ExpiringCompliance  int64   `json:"expiringCompliance"`
	PendingMaintenance  int64   `json:"pendingMaintenance"`
}