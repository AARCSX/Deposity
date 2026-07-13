CREATE TABLE IF NOT EXISTS tenant_profiles (
    tenant_id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT DEFAULT '',
    gst_number TEXT DEFAULT '',
    pan_number TEXT DEFAULT '',
    address TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
