# Deposity Backend — Production-Ready Implementation Plan

A modular monolith in **Go + Gin + pgx**, deployed on **Google Cloud Run**, with **Docker Compose** for local dev and **Air** for hot-reloading.

---

## Current State Assessment

### What exists today

| Layer | Status |
|---|---|
| `cmd/api/main.go` | **348 lines of in-memory mock code**. All maintenance CRUD, structs, filtering, and CORS live in one file. No database. No connection to `internal/`. |
| `internal/` modules | **Empty stubs** — every `.go` file in `vehicles/`, `trips/`, `companies/`, `maintenance/`, `drivers/`, `dashboard/`, `auth/` contains only a `package` declaration. |
| `internal/platform/` | **Empty directories** — `database/`, `middleware/`, `logger/`, `server/`, `http/`, `utlis/`, `error/` are all empty. |
| `internal/config/` | **Empty directory**. |
| `migrations/` | **Empty directory**. |
| `cmd/worker/` | **Empty directory**. |
| `.air.toml` | Properly configured, ready to use. |
| `go.mod` | Module `github.com/Akshansh-29072005/Deposity/backend`, Go 1.25.3, only Gin dependency installed. |

## User Review Required

> [!IMPORTANT]
> **Technology Choices (Confirmed)**:
> - **Database**: `pgx/v5` with `pgxpool` for raw SQL performance, connected to **Neon PostgreSQL**.
> - **Migrations**: `golang-migrate` running raw `.up.sql` / `.down.sql` files from `migrations/`.
> - **HTTP Framework**: Gin.
> - **Hot Reload**: Air (already configured).
> - **Deployment**: Docker multi-stage build → Google Cloud Run.
> - **Local Dev**: Docker Compose orchestrating backend (with Air) + frontend (Next.js).

## Open Questions

> [!CAUTION]
> 1. Please provide the **Neon DB connection pooling string** when you're ready — we'll store it in `.env` as `DATABASE_URL`.
yes i am ready with the url
> 2. The frontend currently calls endpoints at the **root path** (e.g. `GET /vehicles`, `POST /trips`). Should we keep this for backward compatibility, or migrate to **`/api/v1/vehicles`** (industry standard)? We will use the versioning from the day one to avoid unnecessary headaches.
> 3. The `drivers` module has stub files — should we implement it in this phase, or defer it (since the frontend `/drivers` page is still using hardcoded mock data)?
we will implement the driver package in the 3 of domain implemenatation and remove the hardcoded mock data.

---

## Proposed Changes

### Phase 0 — Housekeeping & Cleanup

#### [DELETE] `model.go` from all domain modules
Remove redundant `model.go` files from `vehicles/`, `trips/`, `companies/`, `maintenance/`, `drivers/`, `dashboard/`.

#### [RENAME] `internal/platform/utlis/` → `internal/platform/utils/`
Fix typo.

#### [RENAME] `internal/platform/error/` → `internal/platform/apperror/`
Avoid collision with Go's built-in `error` type.

#### [DELETE] `cmd/worker/`
No background worker use case in a Cloud Run monolith.

---

### Phase 1 — Infrastructure Layer

#### [NEW] `internal/config/config.go`
Environment-based configuration loader:
```go
type Config struct {
    Port        string // $PORT (Cloud Run injects this)
    DatabaseURL string // $DATABASE_URL (Neon pooling string)
    CORSOrigins string // $CORS_ORIGINS (comma-separated)
}
```
- Uses `os.Getenv` with sensible defaults for local dev.
- No third-party dependency needed (Go stdlib is sufficient).

#### [NEW] `internal/platform/database/db.go`
`pgxpool` connection manager:
- Parse `DATABASE_URL` via `pgxpool.ParseConfig`.
- Configure pool sizes (`MaxConns`, `MinConns`, `MaxConnLifetime`).
- Export a `Connect(ctx, dsn) (*pgxpool.Pool, error)` function.
- Health check with `pool.Ping(ctx)`.

#### [NEW] `internal/platform/apperror/apperror.go`
Structured application error type:
```go
type AppError struct {
    Code    int    `json:"-"`
    Message string `json:"error"`
}
```
- Standard error constants: `ErrNotFound`, `ErrBadRequest`, `ErrInternal`.

#### [NEW] `internal/platform/middleware/cors.go`
Extract the existing CORS middleware from `main.go` into a reusable function, using the configurable `CORSOrigins`.

#### [NEW] `internal/platform/middleware/recovery.go`
Gin panic recovery middleware that catches panics and returns structured JSON errors instead of crashing.

#### [NEW] `.env.example`
Template environment file with all required variables documented.

#### [NEW] `Dockerfile`
Multi-stage build for Cloud Run:
```dockerfile
# Stage 1: Build
FROM golang:1.25-alpine AS builder
# ... compile binary

# Stage 2: Run
FROM alpine:latest
# ... copy binary, expose $PORT
```

#### [NEW] `docker-compose.yml` (at repo root `/home/akshansh/Depo/`)
Orchestrate local development:
```yaml
services:
  backend:
    build: ./backend
    volumes: ./backend:/app  # Air hot-reload
    ports: 8080:8080
    env_file: ./backend/.env

  frontend:
    build: ./frontend
    ports: 3000:3000
    depends_on: [backend]
```

---

### Phase 2 — Database Migrations (Multi-Tenant)

> [!IMPORTANT]
> Because Deposity integrates with **AARCSX Identity**, all core tables must be multi-tenant. We will add a `tenant_id UUID NOT NULL` column to every table to ensure data is strictly partitioned by the organization.

#### [NEW] `migrations/000001_create_companies.up.sql` / `.down.sql`
```sql
CREATE TABLE companies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL, -- Added for AARCSX Identity Multi-Tenancy
    name        TEXT NOT NULL,
    logo        TEXT DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'Standard Account',
    location    TEXT DEFAULT '',
    contact_person TEXT DEFAULT '',
    phone       TEXT DEFAULT '',
    email       TEXT DEFAULT '',
    total_value NUMERIC(12,2) DEFAULT 0,
    is_paid     BOOLEAN DEFAULT true,
    pending_amount NUMERIC(12,2) DEFAULT 0,
    industry    TEXT DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_companies_tenant ON companies(tenant_id);
```

#### [NEW] `migrations/000002_create_vehicles.up.sql` / `.down.sql`
Flat table matching the nested frontend `VehicleRecord` type:
- `tenant_id` (Multi-Tenancy)
- `registration_number`, `make`, `model`, `year`, `body_type`, `axle_config`, `tonnage_capacity`, `fuel_capacity`, `average_mileage`
- `rc_expiry`, `insurance_expiry`, `puc_expiry`, `fitness_expiry`, `permit_details`
- `ownership_type`, `driver_id`, `home_branch`, `gps_device_id`
- `current_odometer`, `last_serviced_date`
- `status` (enum: `all-good`, `expiring-soon`, `expired-docs`, `maintenance`)

#### [NEW] `migrations/000003_create_trips.up.sql` / `.down.sql`
Flat table matching the nested frontend `TripRecord` type:
- `tenant_id` (Multi-Tenancy)
- `status` (enum: `pending`, `in-transit`, `delivered`)
- `origin_name`, `origin_date`, `destination_name`, `destination_date`, `is_estimated`
- `material`, `weight`, `company`
- `vehicle_id`, `driver_id`
- `total_freight`, `advance_paid`

#### [NEW] `migrations/000004_create_maintenance.up.sql` / `.down.sql`
Direct mapping from the existing `MaintenanceRecord` struct in `main.go`:
- `tenant_id` (Multi-Tenancy)
- `vehicle_id`, `vehicle_number`, `maintenance_type`, `maintenance_date`, `odometer_reading`
- `service_center`, `mechanic`, `cost`, `description`, `parts_replaced`
- `next_service_date`, `next_service_odometer`, `status`, `notes`

---

### Phase 3 — Domain Module Implementation

For **each** of the 4 core modules (`companies`, `vehicles`, `trips`, `maintenance`), we implement the following layered architecture:

```
handler.go  ←  HTTP layer (Gin binding, response)
    ↓
service.go  ←  Business logic & validation
    ↓
repository.go  ←  Raw SQL via pgx
    ↓
entity.go  ←  Go struct = DB row
dto.go     ←  Request/Response JSON shapes
routes.go  ←  func RegisterRoutes(rg *gin.RouterGroup, pool *pgxpool.Pool)
```

#### Auth Module (Integration with AARCSX Identity)
Because Deposity delegates authentication to **AARCSX Identity** via OAuth 2.1 PKCE:
- **`internal/auth/handler.go`**: Handles the `/callback` from the identity provider and exchanges the `code` for an `access_token` and `refresh_token` via the `/oauth-token` Supabase edge function.
- **`internal/platform/middleware/auth.go`**: A zero-trust Gin middleware that verifies incoming JWTs using the public keys from AARCSX Identity's `/oauth-jwks` endpoint. It extracts the `tenant_id` and `user_id` and injects them into the `*gin.Context` for downstream handlers to use.

#### Companies Module
| File | Content |
|---|---|
| `entity.go` | `Company` struct with `db` scan tags |
| `dto.go` | `CreateCompanyRequest`, `UpdateCompanyRequest` with Gin `binding` tags |
| `repository.go` | `INSERT`, `SELECT`, `UPDATE`, `DELETE` raw SQL queries |
| `service.go` | Validation (unique name check, status enum validation) |
| `handler.go` | `List`, `GetByID`, `Create`, `Update`, `Delete` handlers |
| `routes.go` | `GET /companies`, `GET /companies/:id`, `POST /companies`, `PATCH /companies/:id`, `DELETE /companies/:id` |

#### Vehicles Module
Same layered structure. Additional logic:
- Service layer computes `status` field dynamically based on compliance expiry dates.
- Repository supports filtering by status, ownership type.

#### Trips Module
Same layered structure. Additional logic:
- Service layer validates that assigned `vehicleId` exists and is not already on an active trip.
- Repository supports filtering by status.

#### Maintenance Module
Same layered structure. Migrates all filtering logic (by vehicle, type, status, date range) from `main.go` into the repository layer using parameterized SQL queries.

---

### Phase 4 — Dashboard Aggregation

#### [NEW] `internal/dashboard/handler.go` + `service.go` + `routes.go`
A **read-only** module that runs cross-table SQL aggregation queries:

| Metric | SQL Strategy |
|---|---|
| Total Vehicles | `SELECT COUNT(*) FROM vehicles` |
| Active Trips | `SELECT COUNT(*) FROM trips WHERE status = 'in-transit'` |
| Unique Drivers | `SELECT COUNT(DISTINCT driver_id) FROM vehicles` |
| Monthly Revenue | `SELECT DATE_TRUNC('month', origin_date) AS month, SUM(total_freight) FROM trips GROUP BY month ORDER BY month DESC LIMIT 6` |
| Expiring Compliance | `SELECT * FROM vehicles WHERE rc_expiry < NOW() + INTERVAL '30 days' OR ...` |
| Overdue Maintenance | `SELECT * FROM maintenance WHERE status = 'Scheduled' AND maintenance_date < NOW()` |

Endpoint: `GET /dashboard/stats`

---

### Phase 5 — Server Bootstrap

#### [MODIFY] `cmd/api/main.go`
Complete rewrite — replace the 348-line mock with a clean bootstrap:

```go
func main() {
    cfg := config.Load()
    pool := database.Connect(ctx, cfg.DatabaseURL)
    defer pool.Close()

    router := gin.Default()
    router.Use(middleware.CORS(cfg.CORSOrigins))
    router.Use(middleware.Recovery())

    // Register all domain routes
    companies.RegisterRoutes(router.Group("/companies"), pool)
    vehicles.RegisterRoutes(router.Group("/vehicles"), pool)
    trips.RegisterRoutes(router.Group("/trips"), pool)
    maintenance.RegisterRoutes(router.Group("/maintenance"), pool)
    dashboard.RegisterRoutes(router.Group("/dashboard"), pool)

    router.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "pong"})
    })

    router.Run(":" + cfg.Port)
}
```

---

## Final Directory Structure

```
backend/
├── .air.toml                          # Hot reload config (exists)
├── .env                               # Local secrets (gitignored)
├── .env.example                       # Template
├── .gitignore                         # (exists)
├── Dockerfile                         # Multi-stage Cloud Run build
├── go.mod / go.sum
├── cmd/
│   └── api/
│       └── main.go                    # Bootstrap entrypoint
├── migrations/
│   ├── 000001_create_companies.up.sql
│   ├── 000001_create_companies.down.sql
│   ├── 000002_create_vehicles.up.sql
│   ├── 000002_create_vehicles.down.sql
│   ├── 000003_create_trips.up.sql
│   ├── 000003_create_trips.down.sql
│   ├── 000004_create_maintenance.up.sql
│   └── 000004_create_maintenance.down.sql
└── internal/
    ├── config/
    │   └── config.go
    ├── platform/
    │   ├── apperror/
    │   │   └── apperror.go
    │   ├── database/
    │   │   └── db.go
    │   ├── middleware/
    │   │   ├── cors.go
    │   │   └── recovery.go
    │   └── utils/
    ├── companies/
    │   ├── entity.go
    │   ├── dto.go
    │   ├── repository.go
    │   ├── service.go
    │   ├── handler.go
    │   └── routes.go
    ├── vehicles/
    │   └── (same structure)
    ├── trips/
    │   └── (same structure)
    ├── maintenance/
    │   └── (same structure)
    └── dashboard/
        ├── dto.go
        ├── service.go
        ├── handler.go
        └── routes.go
```

---

## Verification Plan

### Automated
1. `go vet ./...` — static analysis.
2. `go build ./cmd/api` — confirm binary compiles.
3. Run migrations against Neon DB and verify tables exist.

### Manual
1. Start with `docker-compose up` and confirm both backend + frontend spin up.
2. `curl` all CRUD endpoints and verify JSON matches frontend type contracts.
3. Create records from the frontend wizards and confirm data persists across page reloads.
