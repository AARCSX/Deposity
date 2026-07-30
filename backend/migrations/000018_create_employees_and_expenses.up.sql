CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Fleet Operator',
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    base_salary NUMERIC(10,2) DEFAULT 0,
    pending_balance NUMERIC(10,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    avatar TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    recipient_type TEXT NOT NULL, -- 'driver', 'employee'
    recipient_id UUID NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL,
    pending_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_mode TEXT DEFAULT 'Bank Transfer',
    notes TEXT DEFAULT '',
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Salary', 'EMI', 'Fuel & Fleet', 'Office & Misc'
    title TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    recipient_type TEXT DEFAULT '',
    recipient_id UUID,
    vehicle_id UUID,
    payment_mode TEXT DEFAULT 'Bank Transfer',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_recipient ON salary_payments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
