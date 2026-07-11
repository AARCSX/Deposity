CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    phone TEXT NOT NULL UNIQUE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    
    license_number TEXT NOT NULL UNIQUE,
    license_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    
    salary NUMERIC(10,2) DEFAULT 0,
    pending_balance NUMERIC(10,2) DEFAULT 0,
    
    is_status_warning BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_vehicle_id ON drivers(vehicle_id);

-- Add foreign key from vehicles to drivers now that drivers table exists
ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_driver_id FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
-- Add foreign key from trips to drivers
ALTER TABLE trips ADD CONSTRAINT fk_trips_driver_id FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
