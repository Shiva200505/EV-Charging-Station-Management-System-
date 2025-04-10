const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all charging stations
router.get('/', async (req, res) => {
    try {
        console.log('Fetching charging stations...');
        const [stations] = await db.execute(`
            SELECT 
                id,
                name,
                address,
                total_slots,
                LEAST(available_slots, total_slots) as available_slots,
                charging_type,
                power_rating,
                price_per_kwh,
                status,
                created_at,
                updated_at
            FROM charging_stations
            ORDER BY name ASC
        `);
        
        // Transform the data to match frontend expectations
        const transformedStations = stations.map(station => ({
            ...station,
            location: station.address,
            available_slots: Math.min(station.available_slots, station.total_slots) // Additional safety check
        }));
        
        console.log('Fetched stations:', transformedStations);
        res.json(transformedStations);
    } catch (error) {
        console.error('Error fetching charging stations:', error);
        res.status(500).json({ message: 'Error fetching charging stations', error: error.message });
    }
});

// GET single charging station
router.get('/:id', async (req, res) => {
    try {
        const [stations] = await db.execute(`
            SELECT 
                id,
                name,
                address as location,
                total_slots,
                LEAST(available_slots, total_slots) as available_slots,
                charging_type,
                power_rating,
                price_per_kwh,
                status,
                created_at,
                updated_at
            FROM charging_stations 
            WHERE id = ?
        `, [req.params.id]);
        
        if (stations.length === 0) {
            return res.status(404).json({ message: 'Charging station not found' });
        }

        // Additional safety check
        stations[0].available_slots = Math.min(stations[0].available_slots, stations[0].total_slots);
        
        res.json(stations[0]);
    } catch (error) {
        console.error('Error fetching charging station:', error);
        res.status(500).json({ message: 'Error fetching charging station' });
    }
});

// POST create new charging station
router.post('/', async (req, res) => {
    try {
        const { 
            name, 
            address, 
            total_slots, 
            available_slots, 
            charging_type,
            power_rating,
            price_per_kwh,
            status = 'active'
        } = req.body;

        // Validate that available slots don't exceed total slots
        const validatedAvailableSlots = Math.min(available_slots, total_slots);

        const [result] = await db.execute(
            `INSERT INTO charging_stations (
                name, 
                address, 
                total_slots, 
                available_slots,
                charging_type,
                power_rating,
                price_per_kwh,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, address, total_slots, validatedAvailableSlots, charging_type, power_rating, price_per_kwh, status]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Charging station created successfully' 
        });
    } catch (error) {
        console.error('Error creating charging station:', error);
        res.status(500).json({ message: 'Error creating charging station' });
    }
});

// PUT update charging station
router.put('/:id', async (req, res) => {
    try {
        const { 
            name, 
            address, 
            total_slots, 
            available_slots,
            charging_type,
            power_rating,
            price_per_kwh,
            status
        } = req.body;

        // Validate that available slots don't exceed total slots
        const validatedAvailableSlots = Math.min(available_slots, total_slots);

        await db.execute(
            `UPDATE charging_stations 
             SET name = ?, 
                 address = ?, 
                 total_slots = ?, 
                 available_slots = ?,
                 charging_type = ?,
                 power_rating = ?,
                 price_per_kwh = ?,
                 status = ?
             WHERE id = ?`,
            [name, address, total_slots, validatedAvailableSlots, charging_type, power_rating, price_per_kwh, status, req.params.id]
        );
        
        res.json({ message: 'Charging station updated successfully' });
    } catch (error) {
        console.error('Error updating charging station:', error);
        res.status(500).json({ message: 'Error updating charging station' });
    }
});

// DELETE charging station
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM charging_stations WHERE id = ?', [req.params.id]);
        res.json({ message: 'Charging station deleted successfully' });
    } catch (error) {
        console.error('Error deleting charging station:', error);
        res.status(500).json({ message: 'Error deleting charging station' });
    }
});

module.exports = router; 