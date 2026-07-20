CREATE TABLE IF NOT EXISTS fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    fuel_type VARCHAR(50) NOT NULL DEFAULT 'Diesel',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    litres NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    price_per_litre NUMERIC(10,2),
    station_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_tenant_vehicle ON fuel_logs(tenant_id, vehicle_id);
