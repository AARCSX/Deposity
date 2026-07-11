CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Core specifications
    registration_number TEXT UNIQUE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    body_type TEXT NOT NULL,
    axle_config TEXT NOT NULL,
    tonnage_capacity NUMERIC(10,2) NOT NULL,
    fuel_capacity NUMERIC(10,2) NOT NULL,
    average_mileage NUMERIC(10,2) NOT NULL,
    
    -- Compliance Documents
    rc_expiry TIMESTAMP WITH TIME ZONE,
    insurance_expiry TIMESTAMP WITH TIME ZONE,
    puc_expiry TIMESTAMP WITH TIME ZONE,
    fitness_expiry TIMESTAMP WITH TIME ZONE,
    permit_details TEXT DEFAULT '',
    
    -- Ownership Status
    ownership_type TEXT NOT NULL,
    driver_id UUID, -- Will be a foreign key to drivers table once created
    home_branch TEXT DEFAULT '',
    gps_device_id TEXT DEFAULT '',
    
    -- Maintenance Data
    current_odometer INT DEFAULT 0,
    last_serviced_date TIMESTAMP WITH TIME ZONE,
    
    status TEXT NOT NULL DEFAULT 'all-good',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_status ON vehicles(status);
