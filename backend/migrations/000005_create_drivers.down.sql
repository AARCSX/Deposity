ALTER TABLE trips DROP CONSTRAINT IF EXISTS fk_trips_driver_id;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_driver_id;
DROP TABLE IF EXISTS drivers;
