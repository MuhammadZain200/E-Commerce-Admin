// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();

// Import middlewares
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Import controllers
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} = require('../controllers/productController');
const { getDashboardStats } = require('../controllers/dashboardController');
const { getAnalytics } = require('../controllers/analyticsController');

// ✅ Routes

// Get all products (any logged-in user)
router.get('/', protect, getProducts);

// Create a new product (admin only)
router.post('/', protect, roleMiddleware('admin'), createProduct);

// Update product by ID (admin only)
router.put('/:id', protect, roleMiddleware('admin'), updateProduct);

// Delete product (admin only)
router.delete('/:id', protect, roleMiddleware('admin'), deleteProduct);

// Dashboard stats (any authenticated user - admin)
router.get('/dashboard/stats', protect, getDashboardStats);

// Analytics endpoint (admin only)
router.get('/analytics', protect, roleMiddleware('admin'), getAnalytics);

// Optional test route
router.get(
  '/test',
  protect,
  roleMiddleware('admin'),
  (req, res) => {
    res.json({ message: 'Access granted: Welcome Admin!' });
  }
);

module.exports = router;
