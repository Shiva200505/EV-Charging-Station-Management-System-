const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const db = require('../config/database');
const { sendCancellationEmail } = require('../utils/email');

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { station_id, vehicle_type, slot_time, duration, total_amount } = req.body;
    const user_id = req.user.userId;

    // Validate required fields
    if (!station_id || !vehicle_type || !slot_time || !duration || !total_amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate end time
    const start_time = new Date(slot_time);
    const end_time = new Date(start_time.getTime() + duration * 60000); // Convert duration from minutes to milliseconds

    // Verify station exists
    const [stations] = await db.execute('SELECT id, available_slots FROM charging_stations WHERE id = ?', [station_id]);
    if (stations.length === 0) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // Check if station has available slots
    if (stations[0].available_slots <= 0) {
      return res.status(400).json({ message: 'No available slots at this station' });
    }

    // Check for overlapping bookings with same vehicle type
    const [existingBookings] = await db.execute(
      `SELECT * FROM bookings 
       WHERE station_id = ? 
       AND vehicle_type = ?
       AND status != 'cancelled'
       AND (
         (start_time <= ? AND end_time > ?) OR
         (start_time < ? AND end_time >= ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [
        station_id,
        vehicle_type,
        end_time,
        start_time,
        end_time,
        start_time,
        start_time,
        end_time
      ]
    );

    if (existingBookings.length > 0) {
      return res.status(400).json({ 
        message: 'This slot is already booked for the selected vehicle type at this time. Please choose a different time or vehicle type.'
      });
    }

    // Create booking
    const [result] = await db.execute(
      'INSERT INTO bookings (user_id, station_id, vehicle_type, start_time, end_time, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, station_id, vehicle_type, start_time, end_time, total_amount, 'pending']
    );

    // Update available slots
    await db.execute(
      'UPDATE charging_stations SET available_slots = available_slots - 1 WHERE id = ?',
      [station_id]
    );

    res.status(201).json({ 
      message: 'Booking created successfully',
      id: result.insertId,
      total_amount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await db.execute(
      `SELECT b.*, cs.name as station_name, cs.address 
       FROM bookings b 
       JOIN charging_stations cs ON b.station_id = cs.id 
       WHERE b.user_id = ?`,
      [req.user.userId]
    );
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await db.execute(
      `SELECT b.*, cs.name as station_name, cs.address 
       FROM bookings b 
       JOIN charging_stations cs ON b.station_id = cs.id 
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.userId]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(bookings[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute(
      'UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.userId]
    );
    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking route
router.post('/cancel/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get booking details before cancellation
    const [bookings] = await db.execute(
      'SELECT b.*, s.name as station_name, s.address, u.email, u.name as user_name FROM bookings b ' +
      'JOIN charging_stations s ON b.station_id = s.id ' +
      'JOIN users u ON b.user_id = u.id ' +
      'WHERE b.id = ? AND b.user_id = ?',
      [id, userId]
    );

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    const booking = bookings[0];

    // Update booking status to cancelled
    await db.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    // Update available slots in the station
    await db.execute(
      'UPDATE charging_stations SET available_slots = available_slots + 1 WHERE id = ?',
      [booking.station_id]
    );

    // Send cancellation email
    await sendCancellationEmail({
      userEmail: booking.email,
      userName: booking.user_name,
      bookingDetails: {
        id: booking.id,
        stationName: booking.station_name,
        location: booking.address,
        startTime: booking.start_time,
        amount: booking.total_amount
      }
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

module.exports = router; 