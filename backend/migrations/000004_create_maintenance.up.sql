CREATE TABLE IF NOT EXISTS maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    vehicle_number TEXT NOT NULL,
    
    maintenance_type TEXT NOT NULL,
    maintenance_date TIMESTAMP WITH TIME ZONE NOT NULL,
    odometer_reading INT NOT NULL,
    
    service_center TEXT DEFAULT '',
    mechanic TEXT DEFAULT '',
    cost NUMERIC(10,2) DEFAULT 0,
    description TEXT DEFAULT '',
    parts_replaced TEXT DEFAULT '',
    
    next_service_date TIMESTAMP WITH TIME ZONE,
    next_service_odometer INT DEFAULT 0,
    
    status TEXT NOT NULL DEFAULT 'Completed',
    notes TEXT DEFAULT '',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_maintenance_vehicle_id ON maintenance(vehicle_id);
CREATE INDEX idx_maintenance_status ON maintenance(status);
