// backend/server.js

// Load environment variables
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

// Middlewares
app.use(express.json()); // parse JSON bodies
app.use(cors({ origin: 'http://localhost:3000' })); // allow frontend

// Import routes
const adminRoutes = require('./routes/adminRoutes'); // Admin product routes
const authRoutes = require('./routes/authRoutes');   // Auth routes (login, register, etc)
const orderRoutes = require('./routes/orderRoutes');  // Order routes
const settingsRoutes = require('./routes/settingsRoutes'); // Settings & User management routes
const categoryRoutes = require('./routes/categoryRoutes'); // Category & Subcategory routes (admin)
const userProductRoutes = require('./routes/userProductRoutes'); // User product browsing routes
const cartRoutes = require('./routes/cartRoutes'); // Cart routes (user)
const staffRoutes = require('./routes/staffRoutes'); // Staff routes

// Mount routes
// IMPORTANT: Mount specific routes BEFORE parameterized routes to avoid route conflicts
app.use('/api/admin', settingsRoutes); // settings & user management routes (specific paths first)
app.use('/api/admin', categoryRoutes); // category routes (specific paths)
app.use('/api/admin', adminRoutes); // admin product routes (parameterized routes)
app.use('/api/auth', authRoutes);   // authentication routes
app.use('/api/products', userProductRoutes); // user product browsing (public/user)
app.use('/api/cart', cartRoutes); // cart routes (user only)
app.use('/api/staff', staffRoutes); // staff routes
app.use('/api/orders', orderRoutes); // order routes

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
