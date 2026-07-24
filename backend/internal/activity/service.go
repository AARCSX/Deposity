package activity

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ActivityLog struct {
	ID          string                 `json:"id"`
	TenantID    string                 `json:"tenant_id"`
	UserID      string                 `json:"user_id"`
	UserName    string                 `json:"user_name"`
	UserRole    string                 `json:"user_role"`
	Action      string                 `json:"action"`
	Category    string                 `json:"category"`
	EntityType  string                 `json:"entity_type"`
	EntityID    string                 `json:"entity_id"`
	Description string                 `json:"description"`
	Metadata    map[string]interface{} `json:"metadata"`
	IPAddress   string                 `json:"ip_address"`
	CreatedAt   time.Time              `json:"created_at"`
}

type LogActivityParams struct {
	TenantID    string
	UserID      string
	UserName    string
	UserRole    string
	Action      string
	Category    string
	EntityType  string
	EntityID    string
	Description string
	Metadata    map[string]interface{}
	IPAddress   string
}

type LogFilter struct {
	TenantID  string
	Category  string
	UserID    string
	Action    string
	Search    string
	StartDate string
	EndDate   string
	Page      int
	Limit     int
}

type PaginatedResult struct {
	Data       []ActivityLog `json:"data"`
	Total      int           `json:"total"`
	Page       int           `json:"page"`
	Limit      int           `json:"limit"`
	TotalPages int           `json:"total_pages"`
}

type ActivityStats struct {
	TotalActions24h   int                    `json:"total_actions_24h"`
	ActiveStaffCount  int                    `json:"active_staff_count"`
	CategoryBreakdown map[string]int         `json:"category_breakdown"`
	TopStaffMember    string                 `json:"top_staff_member"`
	HighSeverityCount int                    `json:"high_severity_count"`
}

// LogActivity logs an audit entry asynchronously to prevent blocking primary business logic.
func LogActivity(db *pgxpool.Pool, params LogActivityParams) {
	if db == nil || params.TenantID == "" {
		return
	}

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		metadataJSON := "{}"
		if params.Metadata != nil {
			if b, err := json.Marshal(params.Metadata); err == nil {
				metadataJSON = string(b)
			}
		}

		query := `
			INSERT INTO activity_logs (
				tenant_id, user_id, user_name, user_role, action,
				category, entity_type, entity_id, description, metadata, ip_address
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)
		`

		_, err := db.Exec(ctx, query,
			params.TenantID,
			params.UserID,
			params.UserName,
			params.UserRole,
			params.Action,
			params.Category,
			params.EntityType,
			params.EntityID,
			params.Description,
			metadataJSON,
			params.IPAddress,
		)

		if err != nil {
			log.Printf("[activity] Failed to log activity '%s' for tenant '%s': %v", params.Action, params.TenantID, err)
		}
	}()
}

// GetActivityLogs retrieves paginated activity log records for a tenant.
func GetActivityLogs(ctx context.Context, db *pgxpool.Pool, filter LogFilter) (PaginatedResult, error) {
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 || filter.Limit > 100 {
		filter.Limit = 20
	}
	offset := (filter.Page - 1) * filter.Limit

	whereClause := "WHERE tenant_id = $1"
	args := []interface{}{filter.TenantID}
	argCount := 1

	if filter.Category != "" && filter.Category != "ALL" {
		argCount++
		whereClause += fmt.Sprintf(" AND category = $%d", argCount)
		args = append(args, filter.Category)
	}

	if filter.UserID != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND user_id = $%d", argCount)
		args = append(args, filter.UserID)
	}

	if filter.Action != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND action = $%d", argCount)
		args = append(args, filter.Action)
	}

	if filter.Search != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND (description ILIKE $%d OR user_name ILIKE $%d OR entity_id ILIKE $%d)", argCount, argCount, argCount)
		args = append(args, "%"+filter.Search+"%")
	}

	if filter.StartDate != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND created_at >= $%d::timestamptz", argCount)
		args = append(args, filter.StartDate)
	}

	if filter.EndDate != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND created_at <= $%d::timestamptz", argCount)
		args = append(args, filter.EndDate)
	}

	// Count Query
	countQuery := "SELECT COUNT(*) FROM activity_logs " + whereClause
	var total int
	err := db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return PaginatedResult{}, err
	}

	// Select Query
	selectQuery := fmt.Sprintf(`
		SELECT id, tenant_id, user_id, user_name, user_role, action,
		       category, entity_type, entity_id, description, metadata, ip_address, created_at
		FROM activity_logs %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d`, whereClause, argCount+1, argCount+2)

	selectArgs := append(args, filter.Limit, offset)

	rows, err := db.Query(ctx, selectQuery, selectArgs...)
	if err != nil {
		return PaginatedResult{}, err
	}
	defer rows.Close()

	logs := []ActivityLog{}
	for rows.Next() {
		var l ActivityLog
		var metadataBytes []byte
		err := rows.Scan(
			&l.ID, &l.TenantID, &l.UserID, &l.UserName, &l.UserRole, &l.Action,
			&l.Category, &l.EntityType, &l.EntityID, &l.Description, &metadataBytes, &l.IPAddress, &l.CreatedAt,
		)
		if err != nil {
			return PaginatedResult{}, err
		}

		if len(metadataBytes) > 0 {
			_ = json.Unmarshal(metadataBytes, &l.Metadata)
		}
		if l.Metadata == nil {
			l.Metadata = make(map[string]interface{})
		}

		logs = append(logs, l)
	}

	totalPages := (total + filter.Limit - 1) / filter.Limit
	if totalPages == 0 {
		totalPages = 1
	}

	return PaginatedResult{
		Data:       logs,
		Total:      total,
		Page:       filter.Page,
		Limit:      filter.Limit,
		TotalPages: totalPages,
	}, nil
}

// GetActivityStats calculates analytics summary metrics for the owner dashboard.
func GetActivityStats(ctx context.Context, db *pgxpool.Pool, tenantID string) (ActivityStats, error) {
	stats := ActivityStats{
		CategoryBreakdown: make(map[string]int),
	}

	// 1. Total actions in last 24h
	query24h := `SELECT COUNT(*) FROM activity_logs WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`
	_ = db.QueryRow(ctx, query24h, tenantID).Scan(&stats.TotalActions24h)

	// 2. Active staff count in last 7 days
	queryStaff := `SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`
	_ = db.QueryRow(ctx, queryStaff, tenantID).Scan(&stats.ActiveStaffCount)

	// 3. Category breakdown
	queryCategory := `
		SELECT category, COUNT(*) 
		FROM activity_logs 
		WHERE tenant_id = $1 
		GROUP BY category
	`
	rows, err := db.Query(ctx, queryCategory, tenantID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var cat string
			var count int
			if err := rows.Scan(&cat, &count); err == nil {
				stats.CategoryBreakdown[cat] = count
			}
		}
	}

	// 4. Most active staff member in last 30 days
	queryTopStaff := `
		SELECT user_name 
		FROM activity_logs 
		WHERE tenant_id = $1 AND user_name != '' AND created_at >= NOW() - INTERVAL '30 days'
		GROUP BY user_name 
		ORDER BY COUNT(*) DESC 
		LIMIT 1
	`
	_ = db.QueryRow(ctx, queryTopStaff, tenantID).Scan(&stats.TopStaffMember)
	if stats.TopStaffMember == "" {
		stats.TopStaffMember = "Operations Team"
	}

	// 5. High severity count (Deletions, Security, Suspensions, Rate Changes)
	queryHighSeverity := `
		SELECT COUNT(*) 
		FROM activity_logs 
		WHERE tenant_id = $1 AND (action LIKE 'DELETE_%' OR category = 'SECURITY' OR action LIKE 'SUSPEND_%')
	`
	_ = db.QueryRow(ctx, queryHighSeverity, tenantID).Scan(&stats.HighSeverityCount)

	return stats, nil
}
