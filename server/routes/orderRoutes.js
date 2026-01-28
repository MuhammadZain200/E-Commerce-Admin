const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createOrder,
  checkoutFromCart,
  updateOrderStatus,
  getOrders,
  getOrderById,
} = require('../controllers/orderController');

// Create order from items (any authenticated user)
router.post('/', protect, createOrder);

// Checkout from cart (user only)
router.post('/checkout', protect, roleMiddleware('user'), checkoutFromCart);

// Get all orders (admin sees all, users see their own)
router.get('/', protect, getOrders);

// Get single order
router.get('/:id', protect, getOrderById);

// Update order status (admin only)
router.patch('/:id/status', protect, roleMiddleware('admin'), updateOrderStatus);

module.exports = router;

