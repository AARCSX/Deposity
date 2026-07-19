ALTER TABLE fastag_logs ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
ALTER TABLE emi_schedules ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
