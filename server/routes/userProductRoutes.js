// File: routes/userProductRoutes.js
//
// User Product Routes - Public/User routes for browsing products

const express = require('express');
const router = express.Router();

// Import controllers
const {
  getProducts,
  getCategoriesForFilter,
  getProductById,
} = require('../controllers/userProductController');

// ============================================
// PRODUCT BROWSING ROUTES (Public/User)
// ============================================

// GET /api/products - Get products with filters (categoryId, subCategoryId, inStock)
// Query params: ?categoryId=xxx&subCategoryId=yyy&inStock=true
router.get('/', getProducts);

// GET /api/products/categories - Get all categories and subcategories for filtering
router.get('/categories', getCategoriesForFilter);

// GET /api/products/:id - Get single product details
router.get('/:id', getProductById);

module.exports = router;

