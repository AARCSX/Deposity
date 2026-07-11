CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    logo TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Standard Account',
    location TEXT DEFAULT '',
    contact_person TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    total_value NUMERIC(12,2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT true,
    pending_amount NUMERIC(12,2) DEFAULT 0,
    industry TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_companies_status ON companies(status);
