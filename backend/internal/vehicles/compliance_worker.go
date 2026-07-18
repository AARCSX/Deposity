package vehicles

import (
	"context"
	"log"
	"math"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/mail"
)

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
		SELECT id, tenant_id, registration_number, rc_expiry, insurance_expiry, puc_expiry, fitness_expiry
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
	}

	var list []vehicleCheck
	for rows.Next() {
		var vc vehicleCheck
		err := rows.Scan(&vc.ID, &vc.TenantID, &vc.RegistrationNumber, &vc.RCExpiry, &vc.InsuranceExpiry, &vc.PUCExpiry, &vc.FitnessExpiry)
		if err != nil {
			log.Printf("[compliance-worker] ERROR scanning vehicle row: %v", err)
			continue
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
