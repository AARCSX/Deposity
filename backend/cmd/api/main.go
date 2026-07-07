package main

import (
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type MaintenanceRecord struct {
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
	CreatedAt           string  `json:"createdAt"`
	UpdatedAt           string  `json:"updatedAt"`
}

var maintenanceRecords = []MaintenanceRecord{
	{
		ID:                  "MNT-001",
		VehicleID:           "V-101",
		VehicleNumber:       "MH12AB1234",
		MaintenanceType:     "Service",
		MaintenanceDate:     "2026-05-12",
		OdometerReading:     12540,
		ServiceCenter:       "Metro Truck Service",
		Mechanic:            "Rahul Sharma",
		Cost:                8600,
		Description:         "Routine service and brake inspection.",
		PartsReplaced:       "Brake pads, engine oil",
		NextServiceDate:     "2026-08-12",
		NextServiceOdometer: 14540,
		Status:              "Completed",
		Notes:               "Vehicle is running smoothly.",
		CreatedAt:           "2026-05-12T08:00:00Z",
		UpdatedAt:           "2026-05-12T08:00:00Z",
	},
	{
		ID:                  "MNT-002",
		VehicleID:           "V-102",
		VehicleNumber:       "DL04CD5678",
		MaintenanceType:     "Tyre Replacement",
		MaintenanceDate:     "2026-06-18",
		OdometerReading:     9860,
		ServiceCenter:       "Prime Fleet Garage",
		Mechanic:            "Aman Verma",
		Cost:                24000,
		Description:         "Replaced all four tyres after uneven wear.",
		PartsReplaced:       "4 tyres",
		NextServiceDate:     "2026-09-18",
		NextServiceOdometer: 11860,
		Status:              "Scheduled",
		Notes:               "Awaiting delivery of tyres.",
		CreatedAt:           "2026-06-18T09:30:00Z",
		UpdatedAt:           "2026-06-18T09:30:00Z",
	},
	{
		ID:                  "MNT-003",
		VehicleID:           "V-103",
		VehicleNumber:       "HR26EF9012",
		MaintenanceType:     "Inspection",
		MaintenanceDate:     "2026-06-25",
		OdometerReading:     14220,
		ServiceCenter:       "National Transit Hub",
		Mechanic:            "Sanjay Nair",
		Cost:                5400,
		Description:         "Fitness and emission inspection.",
		PartsReplaced:       "None",
		NextServiceDate:     "2026-09-25",
		NextServiceOdometer: 16220,
		Status:              "In Progress",
		Notes:               "Waiting for inspection clearance.",
		CreatedAt:           "2026-06-25T13:00:00Z",
		UpdatedAt:           "2026-06-25T13:00:00Z",
	},
}

var nextMaintenanceID = 4

func main() {
	router := gin.Default()
	router.Use(corsMiddleware())

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	router.GET("/maintenance", listMaintenance)
	router.GET("/maintenance/vehicle/:vehicleId", getMaintenanceByVehicle)
	router.GET("/maintenance/:id", getMaintenanceByID)
	router.POST("/maintenance", createMaintenance)
	router.PATCH("/maintenance/:id", updateMaintenance)
	router.DELETE("/maintenance/:id", deleteMaintenance)

	router.Run(":8080")
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PATCH, DELETE")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func listMaintenance(c *gin.Context) {
	records := append([]MaintenanceRecord(nil), maintenanceRecords...)
	vehicleFilter := strings.TrimSpace(c.Query("vehicle"))
	maintenanceTypeFilter := strings.TrimSpace(c.Query("type"))
	statusFilter := strings.TrimSpace(c.Query("status"))
	fromDate := strings.TrimSpace(c.Query("from"))
	toDate := strings.TrimSpace(c.Query("to"))

	if vehicleFilter != "" {
		records = filterByVehicle(records, vehicleFilter)
	}
	if maintenanceTypeFilter != "" {
		records = filterByType(records, maintenanceTypeFilter)
	}
	if statusFilter != "" {
		records = filterByStatus(records, statusFilter)
	}
	if fromDate != "" || toDate != "" {
		records = filterByDateRange(records, fromDate, toDate)
	}

	sort.Slice(records, func(i, j int) bool {
		left := parseDate(records[i].MaintenanceDate)
		right := parseDate(records[j].MaintenanceDate)
		return left.After(right)
	})

	c.JSON(http.StatusOK, records)
}

func getMaintenanceByID(c *gin.Context) {
	id := c.Param("id")
	for _, record := range maintenanceRecords {
		if record.ID == id {
			c.JSON(http.StatusOK, record)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "maintenance record not found"})
}

func getMaintenanceByVehicle(c *gin.Context) {
	vehicleID := c.Param("vehicleId")
	matching := make([]MaintenanceRecord, 0)
	for _, record := range maintenanceRecords {
		if record.VehicleID == vehicleID || record.VehicleNumber == vehicleID {
			matching = append(matching, record)
		}
	}
	sort.Slice(matching, func(i, j int) bool {
		left := parseDate(matching[i].MaintenanceDate)
		right := parseDate(matching[j].MaintenanceDate)
		return left.After(right)
	})
	c.JSON(http.StatusOK, matching)
}

func createMaintenance(c *gin.Context) {
	var payload MaintenanceRecord
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(payload.VehicleID) == "" || strings.TrimSpace(payload.VehicleNumber) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "vehicleId and vehicleNumber are required"})
		return
	}

	payload.ID = fmt.Sprintf("MNT-%03d", nextMaintenanceID)
	nextMaintenanceID++
	if payload.CreatedAt == "" {
		payload.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	}
	if payload.UpdatedAt == "" {
		payload.UpdatedAt = payload.CreatedAt
	}

	maintenanceRecords = append(maintenanceRecords, payload)
	c.JSON(http.StatusCreated, payload)
}

func updateMaintenance(c *gin.Context) {
	id := c.Param("id")
	for index, record := range maintenanceRecords {
		if record.ID != id {
			continue
		}
		var payload MaintenanceRecord
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if payload.VehicleID != "" {
			record.VehicleID = payload.VehicleID
		}
		if payload.VehicleNumber != "" {
			record.VehicleNumber = payload.VehicleNumber
		}
		if payload.MaintenanceType != "" {
			record.MaintenanceType = payload.MaintenanceType
		}
		if payload.MaintenanceDate != "" {
			record.MaintenanceDate = payload.MaintenanceDate
		}
		if payload.OdometerReading > 0 {
			record.OdometerReading = payload.OdometerReading
		}
		if payload.ServiceCenter != "" {
			record.ServiceCenter = payload.ServiceCenter
		}
		if payload.Mechanic != "" {
			record.Mechanic = payload.Mechanic
		}
		if payload.Cost > 0 {
			record.Cost = payload.Cost
		}
		if payload.Description != "" {
			record.Description = payload.Description
		}
		if payload.PartsReplaced != "" {
			record.PartsReplaced = payload.PartsReplaced
		}
		if payload.NextServiceDate != "" {
			record.NextServiceDate = payload.NextServiceDate
		}
		if payload.NextServiceOdometer > 0 {
			record.NextServiceOdometer = payload.NextServiceOdometer
		}
		if payload.Status != "" {
			record.Status = payload.Status
		}
		if payload.Notes != "" {
			record.Notes = payload.Notes
		}
		record.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
		maintenanceRecords[index] = record
		c.JSON(http.StatusOK, record)
		return
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "maintenance record not found"})
}

func deleteMaintenance(c *gin.Context) {
	id := c.Param("id")
	updated := make([]MaintenanceRecord, 0, len(maintenanceRecords))
	for _, record := range maintenanceRecords {
		if record.ID == id {
			continue
		}
		updated = append(updated, record)
	}
	if len(updated) == len(maintenanceRecords) {
		c.JSON(http.StatusNotFound, gin.H{"error": "maintenance record not found"})
		return
	}
	maintenanceRecords = updated
	c.JSON(http.StatusOK, gin.H{"message": "maintenance record deleted"})
}

func filterByVehicle(records []MaintenanceRecord, vehicle string) []MaintenanceRecord {
	filtered := make([]MaintenanceRecord, 0)
	needle := strings.ToLower(strings.TrimSpace(vehicle))
	for _, record := range records {
		if strings.Contains(strings.ToLower(record.VehicleNumber), needle) {
			filtered = append(filtered, record)
		}
	}
	return filtered
}

func filterByType(records []MaintenanceRecord, maintenanceType string) []MaintenanceRecord {
	filtered := make([]MaintenanceRecord, 0)
	needle := strings.ToLower(strings.TrimSpace(maintenanceType))
	for _, record := range records {
		if strings.Contains(strings.ToLower(record.MaintenanceType), needle) {
			filtered = append(filtered, record)
		}
	}
	return filtered
}

func filterByStatus(records []MaintenanceRecord, status string) []MaintenanceRecord {
	filtered := make([]MaintenanceRecord, 0)
	needle := strings.ToLower(strings.TrimSpace(status))
	for _, record := range records {
		if strings.Contains(strings.ToLower(record.Status), needle) {
			filtered = append(filtered, record)
		}
	}
	return filtered
}

func filterByDateRange(records []MaintenanceRecord, fromDate string, toDate string) []MaintenanceRecord {
	filtered := make([]MaintenanceRecord, 0)
	from := parseDate(fromDate)
	to := parseDate(toDate)
	for _, record := range records {
		current := parseDate(record.MaintenanceDate)
		if fromDate != "" && current.Before(from) {
			continue
		}
		if toDate != "" && current.After(to) {
			continue
		}
		filtered = append(filtered, record)
	}
	return filtered
}

func parseDate(raw string) time.Time {
	if raw == "" {
		return time.Time{}
	}
	parsed, err := time.Parse("2006-01-02", raw)
	if err != nil {
		parsed, err = time.Parse(time.RFC3339, raw)
	}
	if err != nil {
		return time.Time{}
	}
	return parsed
}