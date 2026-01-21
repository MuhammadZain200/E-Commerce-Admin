// Load environment variables from root .env
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ✅ Debug: confirm env variables are loaded
console.log('PORT:', process.env.PORT);
console.log('Mongo URL:', process.env.MONGO_URL);

// Exit if MONGO_URL is missing
if (!process.env.MONGO_URL) {
  console.error('Error: MONGO_URL is not defined in .env');
  process.exit(1);
}

// JSON parser middleware
app.use(express.json());

// CORS middleware
app.use(cors({ origin: 'http://localhost:3000' }));

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
