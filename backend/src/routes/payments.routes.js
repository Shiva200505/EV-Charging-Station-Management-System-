const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const db = require('../config/database');
const { sendPaymentConfirmationEmail } = require('../utils/email');

// Process payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { booking_id, payment_method } = req.body;
    const user_id = req.user.userId;

    // Get booking details
    const [bookings] = await db.execute(
      'SELECT b.*, cs.name as station_name, cs.address FROM bookings b JOIN charging_stations cs ON b.station_id = cs.id WHERE b.id = ? AND b.user_id = ?',
      [booking_id, user_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];
    
    // Create payment record
    const [result] = await db.execute(
      'INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?, "completed")',
      [booking_id, user_id, booking.total_amount, payment_method]
    );

    // Update booking status
    await db.execute(
      'UPDATE bookings SET status = "confirmed" WHERE id = ?',
      [booking_id]
    );

    // Get user email and name
    const [users] = await db.execute(
      'SELECT email, name FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length > 0) {
      try {
        // Send confirmation email
        await sendPaymentConfirmationEmail({
          userEmail: users[0].email,
          userName: users[0].name,
          bookingDetails: {
            id: booking_id,
            stationName: booking.station_name,
            location: booking.address,
            startTime: booking.start_time,
            amount: booking.total_amount
          }
        });
        console.log('Payment confirmation email sent successfully');
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Continue execution even if email fails
      }
    }

    res.status(201).json({
      message: 'Payment processed successfully',
      payment_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's payment history
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const [payments] = await db.execute(
      `SELECT p.*, b.start_time, b.end_time, cs.name as station_name 
       FROM payments p 
       JOIN bookings b ON p.booking_id = b.id 
       JOIN charging_stations cs ON b.station_id = cs.id 
       WHERE p.user_id = ?`,
      [req.user.userId]
    );
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [payments] = await db.execute(
      `SELECT p.*, b.start_time, b.end_time, cs.name as station_name, cs.address
       FROM payments p 
       JOIN bookings b ON p.booking_id = b.id 
       JOIN charging_stations cs ON b.station_id = cs.id 
       WHERE p.id = ? AND p.user_id = ?`,
      [req.params.id, req.user.userId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payments[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 