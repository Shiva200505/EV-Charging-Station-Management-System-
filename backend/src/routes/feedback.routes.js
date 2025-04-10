const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Submit feedback
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { station_id, rating, comment } = req.body;
    const user_id = req.user.userId;

    const [result] = await db.execute(
      'INSERT INTO feedback (user_id, station_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, station_id, rating, comment]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get station feedback
router.get('/station/:id', async (req, res) => {
  try {
    const [feedback] = await db.execute(
      `SELECT f.*, u.name as user_name 
       FROM feedback f 
       JOIN users u ON f.user_id = u.id 
       WHERE f.station_id = ?`,
      [req.params.id]
    );
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's feedback history
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const [feedback] = await db.execute(
      `SELECT f.*, cs.name as station_name 
       FROM feedback f 
       JOIN charging_stations cs ON f.station_id = cs.id 
       WHERE f.user_id = ?`,
      [req.user.userId]
    );
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 