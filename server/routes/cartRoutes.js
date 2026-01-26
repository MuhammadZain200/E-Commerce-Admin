// File: routes/cartRoutes.js
//
// Cart Routes - User-only routes for shopping cart management

const express = require('express');
const router = express.Router();

// Import middlewares
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Import controllers
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

// ============================================
// CART ROUTES (User only)
// ============================================

// GET /api/cart - Get user's cart
router.get('/', protect, roleMiddleware('user'), getCart);

// POST /api/cart - Add item to cart
router.post('/', protect, roleMiddleware('user'), addToCart);

// PUT /api/cart/:productId - Update item quantity in cart
router.put('/:productId', protect, roleMiddleware('user'), updateCartItem);

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', protect, roleMiddleware('user'), removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', protect, roleMiddleware('user'), clearCart);

module.exports = router;

