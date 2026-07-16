ALTER TABLE drivers DROP COLUMN IF EXISTS license_issuance;

ALTER TABLE vehicles 
DROP COLUMN IF EXISTS rc_issuance,
DROP COLUMN IF EXISTS insurance_issuance,
DROP COLUMN IF EXISTS puc_issuance,
DROP COLUMN IF EXISTS fitness_issuance;
