const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/stations', require('./routes/stations.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 