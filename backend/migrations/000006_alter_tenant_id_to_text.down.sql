-- Alter tenant_id columns back to UUID
ALTER TABLE companies ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
ALTER TABLE vehicles ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
ALTER TABLE trips ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
ALTER TABLE drivers ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
ALTER TABLE maintenance ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
