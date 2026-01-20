const express = require('express');
const app = express();

// JSON parser middleware
app.use(express.json());

// Import admin routes
const adminRoutes = require('./routes/adminRoutes');

// Mount admin routes
app.use('/api/admin', adminRoutes);

// Error handler (optional)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
