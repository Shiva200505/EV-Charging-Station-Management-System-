const mongoose = require('mongoose');

const chargingStationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    totalSlots: {
        type: Number,
        required: true,
        min: 1
    },
    availableSlots: {
        type: Number,
        required: true,
        min: 0
    },
    chargingTypes: [{
        type: String,
        enum: ['Fast Charging', 'Standard Charging', 'Super Charging']
    }],
    pricePerHour: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Maintenance', 'Inactive'],
        default: 'Active'
    },
    amenities: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChargingStation', chargingStationSchema); 