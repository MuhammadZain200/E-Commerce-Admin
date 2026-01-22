// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();

// Import middlewares
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Import product controller
const {
  createProduct,
  updateProduct,
  toggleProductStatus,
  getProducts,
} = require('../controllers/productController'); // make sure path is correct

// ✅ Routes

// Get all products (any logged-in user)
router.get('/', protect, getProducts);

// Create a new product (admin only)
router.post('/', protect, roleMiddleware('admin'), createProduct);

// Update product by ID (admin only)
router.put('/:id', protect, roleMiddleware('admin'), updateProduct);

// Toggle product active/inactive (admin only)
router.patch('/:id/toggle', protect, roleMiddleware('admin'), toggleProductStatus);

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
