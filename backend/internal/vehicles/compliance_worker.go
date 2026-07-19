package vehicles

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/mail"
)

type StatePermit struct {
	Name     string `json:"name"`
	Issuance string `json:"issuance"`
	Expiry   string `json:"expiry"`
}

type PermitDetails struct {
	Type             string        `json:"type"`             // legacy
	Issuance         string        `json:"issuance"`         // legacy
	Expiry           string        `json:"expiry"`           // legacy
	States           []StatePermit `json:"states"`           // legacy
	HasNational      *bool         `json:"hasNational"`      // new
	NationalIssuance string        `json:"nationalIssuance"` // new
	NationalExpiry   string        `json:"nationalExpiry"`   // new
	HasState         *bool         `json:"hasState"`         // new
	StatePermits     []StatePermit `json:"statePermits"`     // new
}

func parsePermitDate(dateStr string) time.Time {
	if dateStr == "" {
		return time.Time{}
	}
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		t, err = time.Parse(time.RFC3339, dateStr)
		if err != nil {
			return time.Time{}
		}
	}
	return t
}

// StartComplianceWorker starts a background worker that checks for compliance doc expirations every 24 hours.
func StartComplianceWorker(ctx context.Context, db *pgxpool.Pool, mailClient *mail.Client) {
	log.Println("[compliance-worker] Starting background compliance worker...")

	// Run checks immediately on startup
	runComplianceChecks(ctx, db, mailClient)

	ticker := time.NewTicker(24 * time.Hour)
	go func() {
		for {
			select {
			case <-ctx.Done():
				ticker.Stop()
				log.Println("[compliance-worker] Stopping background compliance worker...")
				return
			case <-ticker.C:
				runComplianceChecks(ctx, db, mailClient)
			}
		}
	}()
}

func runComplianceChecks(ctx context.Context, db *pgxpool.Pool, mailClient *mail.Client) {
	log.Println("[compliance-worker] Running compliance expiration checks...")
	if mailClient == nil {
		log.Println("[compliance-worker] WARNING: Mail client not configured. Skipping checks.")
		return
	}

	// 1. Query all vehicles
	query := `
		SELECT id, tenant_id, registration_number, rc_expiry, insurance_expiry, puc_expiry, fitness_expiry, fastag_expiry, permit_details
		FROM vehicles
	`
	rows, err := db.Query(ctx, query)
	if err != nil {
		log.Printf("[compliance-worker] ERROR querying vehicles: %v", err)
		return
	}
	defer rows.Close()

	type vehicleCheck struct {
		ID                 string
		TenantID           string
		RegistrationNumber string
		RCExpiry           time.Time
		InsuranceExpiry    time.Time
		PUCExpiry          time.Time
		FitnessExpiry      time.Time
		FASTagExpiry       time.Time
		PermitDetails      string
	}

	var list []vehicleCheck
	for rows.Next() {
		var vc vehicleCheck
		var fastagExpiry sql.NullTime
		var permitDetailsPtr *string
		err := rows.Scan(&vc.ID, &vc.TenantID, &vc.RegistrationNumber, &vc.RCExpiry, &vc.InsuranceExpiry, &vc.PUCExpiry, &vc.FitnessExpiry, &fastagExpiry, &permitDetailsPtr)
		if err != nil {
			log.Printf("[compliance-worker] ERROR scanning vehicle row: %v", err)
			continue
		}
		if fastagExpiry.Valid {
			vc.FASTagExpiry = fastagExpiry.Time
		}
		if permitDetailsPtr != nil {
			vc.PermitDetails = *permitDetailsPtr
		}
		list = append(list, vc)
	}

	// 2. Loop and check each vehicle
	now := time.Now().UTC()
	for _, v := range list {
		// Fetch tenant profile details
		toEmail, toName := "", ""
		err := db.QueryRow(ctx, "SELECT email, name FROM tenant_profiles WHERE tenant_id = $1", v.TenantID).Scan(&toEmail, &toName)
		if err != nil || toEmail == "" {
			// Skip if no profile or email set
			continue
		}

		checkDoc(toEmail, toName, v.RegistrationNumber, "Registration Certificate (RC)", v.RCExpiry, now, mailClient)
		checkDoc(toEmail, toName, v.RegistrationNumber, "Insurance Certificate", v.InsuranceExpiry, now, mailClient)
		checkDoc(toEmail, toName, v.RegistrationNumber, "PUC Certificate", v.PUCExpiry, now, mailClient)
		checkDoc(toEmail, toName, v.RegistrationNumber, "Fitness Certificate", v.FitnessExpiry, now, mailClient)
		checkDoc(toEmail, toName, v.RegistrationNumber, "FASTag Expiry", v.FASTagExpiry, now, mailClient)

		// Parse and check permits
		if v.PermitDetails != "" {
			var pd PermitDetails
			if err := json.Unmarshal([]byte(v.PermitDetails), &pd); err == nil {
				// National permit
				hasNational := false
				var nationalExpiry time.Time
				if pd.HasNational != nil {
					hasNational = *pd.HasNational
					nationalExpiry = parsePermitDate(pd.NationalExpiry)
				} else if pd.Type == "National" {
					hasNational = true
					nationalExpiry = parsePermitDate(pd.Expiry)
				}

				if hasNational && !nationalExpiry.IsZero() {
					checkDoc(toEmail, toName, v.RegistrationNumber, "National Permit", nationalExpiry, now, mailClient)
				}

				// State permits
				var statePermits []StatePermit
				if pd.HasState != nil {
					if *pd.HasState {
						statePermits = pd.StatePermits
					}
				} else if pd.Type == "State" {
					statePermits = pd.States
				}

				for _, sp := range statePermits {
					spExpiry := parsePermitDate(sp.Expiry)
					if sp.Name != "" && !spExpiry.IsZero() {
						checkDoc(toEmail, toName, v.RegistrationNumber, fmt.Sprintf("State Permit (%s)", sp.Name), spExpiry, now, mailClient)
					}
				}
			}
		}
	}
	log.Println("[compliance-worker] Compliance checks completed.")
}

func checkDoc(toEmail, toName, regNum, docName string, expiry time.Time, now time.Time, mailClient *mail.Client) {
	if expiry.IsZero() {
		return
	}
	// Calculate the difference in days. Ceil it so we capture warnings correctly.
	diff := expiry.Sub(now)
	daysLeft := int(math.Ceil(diff.Hours() / 24.0))

	// Trigger reminders at 30, 20, 10, and 1 days before expiry
	if daysLeft == 30 || daysLeft == 20 || daysLeft == 10 || daysLeft == 1 {
		log.Printf("[compliance-worker] Triggering reminder email to %s for vehicle %s document %s expiring in %d days", toEmail, regNum, docName, daysLeft)
		go func() {
			err := mailClient.SendExpiryReminderEmail(toEmail, toName, regNum, docName, expiry, daysLeft)
			if err != nil {
				log.Printf("[compliance-worker] ERROR sending expiry reminder email to %s: %v", toEmail, err)
			}
		}()
	}
}
