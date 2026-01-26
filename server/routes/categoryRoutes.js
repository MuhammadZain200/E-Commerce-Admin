// File: routes/categoryRoutes.js
//
// Category Routes - Admin-only routes for managing categories and subcategories

const express = require('express');
const router = express.Router();

// Import middlewares
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Import controllers
const {
  getCategories,
  createCategory,
  getSubCategories,
  createSubCategory,
} = require('../controllers/categoryController');

// ============================================
// CATEGORY ROUTES (Admin only)
// ============================================

// GET /api/admin/categories - Get all categories
router.get('/', protect, roleMiddleware('admin'), getCategories);

// POST /api/admin/categories - Create category
router.post('/', protect, roleMiddleware('admin'), createCategory);

// ============================================
// SUBCATEGORY ROUTES (Admin only)
// ============================================

// GET /api/admin/subcategories - Get all subcategories (optionally filtered by categoryId query)
router.get('/subcategories', protect, roleMiddleware('admin'), getSubCategories);

// POST /api/admin/subcategories - Create subcategory
router.post('/subcategories', protect, roleMiddleware('admin'), createSubCategory);

module.exports = router;

