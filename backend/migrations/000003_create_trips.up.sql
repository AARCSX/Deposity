CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    status TEXT NOT NULL DEFAULT 'pending',
    
    -- Route Details
    origin_name TEXT NOT NULL,
    origin_date TIMESTAMP WITH TIME ZONE NOT NULL,
    destination_name TEXT NOT NULL,
    destination_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_estimated BOOLEAN DEFAULT true,
    
    -- Cargo Details
    material TEXT NOT NULL,
    weight NUMERIC(10,2) NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Assignment Details
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID,
    
    -- Financials
    total_freight NUMERIC(12,2) DEFAULT 0,
    advance_paid NUMERIC(12,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_company_id ON trips(company_id);
