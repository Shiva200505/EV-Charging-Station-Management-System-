const express = require('express');
const router = express.Router();

// GET /api/vehicles/types
router.get('/types', async (req, res) => {
    try {
        // For now, we'll return static vehicle types
        // Later this can be connected to a database
        const vehicleTypes = [
            { id: 1, type: "Electric Car" },
            { id: 2, type: "Electric Bike" },
            { id: 3, type: "Electric Scooter" },
            { id: 4, type: "Electric Bus" }
        ];
        
        res.json(vehicleTypes);
    } catch (error) {
        console.error('Error fetching vehicle types:', error);
        res.status(500).json({ message: 'Error fetching vehicle types' });
    }
});

module.exports = router; 