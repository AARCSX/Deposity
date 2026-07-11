# AI Agent Context

## Current State (as of July 11, 2026)
- **Branch**: `main`
- **Focus Areas**: v1 Frontend completion (Dashboard, Vehicles, Trips, Companies, Settings, Maintenance).

## Completed Pages (Production-Ready)
- **`/vehicles`** — API-driven, `CreateVehicleWizard` (4-step), optimistic UI, fallback data.
- **`/trips`** — API-driven, `CreateTripWizard` (4-step), data-driven MetricCards, empty state, optimistic UI.
- **`/companies`** — API-driven, `CreateCompanyWizard` (3-step), data-driven MetricCards + Transaction Table, empty state, `formatINR()` helper, optimistic UI.
- **`/maintenance`** — API-driven, dynamic chassis parsing based on active vehicle axle config, real tyre replacement/puncture activity timeline mapping, link to vehicles list, empty states, and optimistic UI.

## Key Files Created
- `src/types/vehicle.ts`, `src/types/trip.ts`, `src/types/company.ts`
- `src/components/vehicles/CreateVehicleWizard.tsx`
- `src/components/trips/CreateTripWizard.tsx`
- `src/components/companies/CreateCompanyWizard.tsx`

## Architecture
- Microservices: Trip, Fleet, Maintenance, Finance, Notification, Analytics
- Auth: AARCSX Identity (JWT)
- DB: Neon PostgreSQL (per-service), Redis, Pub/Sub events

## Next Steps
1. `/settings` page.
2. `/dashboard` page (overview with aggregated data from all services).
3. Backend endpoint implementation in Go microservices.
