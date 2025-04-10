CREATE DATABASE IF NOT EXISTS ev_charging_db;
USE ev_charging_db;

CREATE TABLE IF NOT EXISTS charging_stations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    total_slots INT NOT NULL,
    available_slots INT NOT NULL,
    charging_types JSON,
    price_per_hour DECIMAL(10,2) NOT NULL,
    status ENUM('Active', 'Maintenance', 'Closed') DEFAULT 'Active',
    amenities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO charging_stations (name, location, total_slots, available_slots, charging_types, price_per_hour, status, amenities) VALUES
('Green Energy Hub', 'Downtown', 10, 3, '["Type 2", "CCS"]', 25.00, 'Active', '["Waiting Area", "Cafe", "WiFi"]'),
('EcoCharge Station', 'Main Street', 8, 0, '["Type 2", "CHAdeMO"]', 30.00, 'Maintenance', '["Restroom", "WiFi"]'),
('FastCharge Center', 'Highway 101', 12, 5, '["CCS", "CHAdeMO", "Type 2"]', 35.00, 'Active', '["Waiting Area", "Cafe", "Restroom", "WiFi"]'),
('PowerUp Station', 'Airport Road', 6, 2, '["Type 2"]', 28.00, 'Active', '["Waiting Area", "WiFi"]'),
('VoltCharge Hub', 'City Mall', 15, 7, '["Type 2", "CCS", "CHAdeMO"]', 32.00, 'Active', '["Waiting Area", "Cafe", "Restroom", "WiFi", "Shopping"]'); 