// File: routes/staffRoutes.js
//
// Staff Routes - Staff-only routes for stock and order management

const express = require('express');
const router = express.Router();

// Import middlewares
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Import controllers
const {
  getProductsWithStock,
  updateProductStock,
  getAssignedOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/staffController');

// ============================================
// PRODUCT STOCK ROUTES (Staff)
// ============================================

// GET /api/staff/products - Get all products with stock info
router.get('/products', protect, roleMiddleware('staff', 'admin'), getProductsWithStock);

// PUT /api/staff/products/:id/stock - Update product stock (restock)
router.put('/products/:id/stock', protect, roleMiddleware('staff', 'admin'), updateProductStock);

// ============================================
// ORDER MANAGEMENT ROUTES (Staff)
// ============================================

// GET /api/staff/orders/assigned - Get orders assigned to current staff member
router.get('/orders/assigned', protect, roleMiddleware('staff', 'admin'), getAssignedOrders);

// GET /api/staff/orders - Get all orders (staff can see all)
router.get('/orders', protect, roleMiddleware('staff', 'admin'), getAllOrders);

// PUT /api/staff/orders/:id/status - Update order status
router.put('/orders/:id/status', protect, roleMiddleware('staff', 'admin'), updateOrderStatus);

module.exports = router;

