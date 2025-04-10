USE ev_charging_db;

-- Drop and recreate the charging_stations table
DROP TABLE IF EXISTS charging_stations;
CREATE TABLE charging_stations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    total_slots INT NOT NULL,
    available_slots INT NOT NULL,
    charging_type VARCHAR(50) NOT NULL,
    power_rating VARCHAR(50) NOT NULL,
    price_per_kwh DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample charging stations
INSERT INTO charging_stations (
    name,
    address,
    total_slots,
    available_slots,
    charging_type,
    power_rating,
    price_per_kwh,
    status
) VALUES 
('PowerGrid Station', 'Industrial Area Phase 1, Pune', 8, 4, 'DC Fast', '50kW', 12.45, 'active'),
('EcoFriendly Hub', 'Koregaon Park, Pune', 6, 3, 'AC Level 2', '22kW', 8.35, 'active'),
('QuickCharge Point', 'Phoenix Mall, Viman Nagar', 4, 0, 'DC Fast', '150kW', 15.55, 'maintenance'),
('SolarCharge Station', 'Magarpatta City', 10, 5, 'AC Level 2', '22kW', 9.30, 'active'),
('MegaCharge Center', 'IT Park, Hinjewadi Phase 1', 12, 8, 'DC Fast', '350kW', 18.65, 'active'),
('CityCharge Hub', 'FC Road, Pune', 10, 6, 'AC Level 2', '22kW', 10.40, 'active'),
('EcoPower Station', 'Aundh, Pune', 8, 4, 'DC Fast', '50kW', 11.45, 'active'),
('FastTrack Charging', 'Mumbai-Pune Highway', 10, 7, 'DC Fast', '150kW', 14.50, 'active'),
('PowerUp Point', 'Baner Road', 6, 0, 'AC Level 2', '22kW', 9.35, 'maintenance'),
('GreenCharge Station', 'Kothrud', 8, 5, 'DC Fast', '50kW', 11.40, 'active'),
('VoltCharge Plus', 'Senapati Bapat Road', 15, 10, 'DC Fast', '350kW', 16.60, 'active');

-- Verify the table structure
DESCRIBE charging_stations;

-- Verify the data
SELECT * FROM charging_stations;

-- Add vehicle_type column to bookings table if it doesn't exist
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50) NOT NULL AFTER station_id; 