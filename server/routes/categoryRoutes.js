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
  updateCategory,
  deleteCategory,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require('../controllers/categoryController');

// ============================================
// CATEGORY ROUTES (Admin only)
// ============================================

// GET /api/admin/categories - Get all categories
router.get('/', protect, roleMiddleware('admin'), getCategories);

// POST /api/admin/categories - Create category
router.post('/', protect, roleMiddleware('admin'), createCategory);

// PUT /api/admin/categories/:id - Update category
router.put('/:id', protect, roleMiddleware('admin'), updateCategory);

// DELETE /api/admin/categories/:id - Soft-delete category (set isActive to false)
router.delete('/:id', protect, roleMiddleware('admin'), deleteCategory);

// ============================================
// SUBCATEGORY ROUTES (Admin only)
// ============================================

// GET /api/admin/subcategories - Get all subcategories (optionally filtered by categoryId query)
router.get('/subcategories', protect, roleMiddleware('admin'), getSubCategories);

// POST /api/admin/subcategories - Create subcategory
router.post('/subcategories', protect, roleMiddleware('admin'), createSubCategory);

// PUT /api/admin/subcategories/:id - Update subcategory
router.put('/subcategories/:id', protect, roleMiddleware('admin'), updateSubCategory);

// DELETE /api/admin/subcategories/:id - Soft-delete subcategory (set isActive to false)
router.delete('/subcategories/:id', protect, roleMiddleware('admin'), deleteSubCategory);

module.exports = router;

