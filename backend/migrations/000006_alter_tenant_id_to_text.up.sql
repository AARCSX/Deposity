-- Alter tenant_id columns from UUID to VARCHAR(50) in all tables
ALTER TABLE companies ALTER COLUMN tenant_id TYPE VARCHAR(50);
ALTER TABLE vehicles ALTER COLUMN tenant_id TYPE VARCHAR(50);
ALTER TABLE trips ALTER COLUMN tenant_id TYPE VARCHAR(50);
ALTER TABLE drivers ALTER COLUMN tenant_id TYPE VARCHAR(50);
ALTER TABLE maintenance ALTER COLUMN tenant_id TYPE VARCHAR(50);
