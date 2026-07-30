ALTER TABLE maintenance 
DROP COLUMN IF EXISTS old_battery_serial,
DROP COLUMN IF EXISTS new_battery_serial,
DROP COLUMN IF EXISTS old_tyre_serial,
DROP COLUMN IF EXISTS new_tyre_serial;
