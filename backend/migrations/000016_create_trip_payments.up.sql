CREATE TABLE IF NOT EXISTS trip_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_type TEXT NOT NULL DEFAULT 'installment',
    payment_mode TEXT DEFAULT 'Bank Transfer',
    notes TEXT,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_payments_trip_id ON trip_payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_payments_tenant_id ON trip_payments(tenant_id);
