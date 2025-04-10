USE ev_charging_db;

-- Check if the charging_stations table exists and has data
SELECT COUNT(*) as station_count FROM charging_stations;

-- Check the structure of the charging_stations table
DESCRIBE charging_stations;

-- Sample query to see some data
SELECT id, name, address, status, total_slots, available_slots 
FROM charging_stations 
LIMIT 5; 