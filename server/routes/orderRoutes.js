const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createOrder,
  updateOrderStatus,
  getOrders,
  getOrderById,
} = require('../controllers/orderController');

// Create order (any authenticated user)
router.post('/', protect, createOrder);

// Get all orders (admin/staff see all, users see their own)
router.get('/', protect, getOrders);

// Get single order
router.get('/:id', protect, getOrderById);

// Update order status (admin/staff only)
router.patch('/:id/status', protect, roleMiddleware('admin', 'staff'), updateOrderStatus);

module.exports = router;

