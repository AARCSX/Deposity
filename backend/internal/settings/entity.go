package settings

import (
	"time"
)

type TenantProfile struct {
	TenantID  string    `json:"tenantId" db:"tenant_id"`
	Name      string    `json:"name" db:"name"`
	Logo      string    `json:"logo" db:"logo"`
	GstNumber string    `json:"gstNumber" db:"gst_number"`
	PanNumber string    `json:"panNumber" db:"pan_number"`
	Address   string    `json:"address" db:"address"`
	Email     string    `json:"email" db:"email"`
	Phone     string    `json:"phone" db:"phone"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type UpdateSettingsRequest struct {
	Name      *string `json:"name"`
	Logo      *string `json:"logo"`
	GstNumber *string `json:"gstNumber"`
	PanNumber *string `json:"panNumber"`
	Address   *string `json:"address"`
	Email     *string `json:"email"`
	Phone     *string `json:"phone"`
}
