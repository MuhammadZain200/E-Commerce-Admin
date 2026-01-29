// backend/server.js

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

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

// CORS configuration - allow frontend in development, or all origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production (or specify your Render domain)
    : 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));

// Import routes
const adminRoutes = require('./routes/adminRoutes'); // Admin product routes
const authRoutes = require('./routes/authRoutes');   // Auth routes (login, register, etc)
const orderRoutes = require('./routes/orderRoutes');  // Order routes
const settingsRoutes = require('./routes/settingsRoutes'); // Settings & User management routes
const categoryRoutes = require('./routes/categoryRoutes'); // Category & Subcategory routes (admin)
const userProductRoutes = require('./routes/userProductRoutes'); // User product browsing routes
const cartRoutes = require('./routes/cartRoutes'); // Cart routes (user)

// Mount routes
// IMPORTANT: Mount specific routes BEFORE parameterized routes to avoid route conflicts
// Public settings route (no auth) - must be mounted separately
const { getPublicSettings } = require('./controllers/settingsController');
const publicSettingsRouter = express.Router();
publicSettingsRouter.get('/public', getPublicSettings);
app.use('/api/settings', publicSettingsRouter);

// Admin routes - mount in order of specificity to avoid conflicts
// Most specific paths first, then general routes
app.use('/api/admin', settingsRoutes); // settings & user management routes (/settings, /users)
app.use('/api/admin/categories', categoryRoutes); // category routes (/categories, /subcategories)
app.use('/api/admin', adminRoutes); // admin product routes (/, /:id, /dashboard/stats, /analytics)
app.use('/api/auth', authRoutes);   // authentication routes
app.use('/api/products', userProductRoutes); // user product browsing (public/user)
app.use('/api/cart', cartRoutes); // cart routes (user only)
app.use('/api/orders', orderRoutes); // order routes

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Global error handler for API routes
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

// Serve static files from React app in production (must be after API routes)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
