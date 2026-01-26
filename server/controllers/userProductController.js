// File: controllers/userProductController.js
//
// User Product Controller - Product browsing for customers
// Users can filter products by category, subcategory, and availability

const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// ============================================
// GET /api/products (Public/User endpoint)
// ============================================
// Get products with filtering options:
// - categoryId: Filter by category
// - subCategoryId: Filter by subcategory
// - inStock: true/false (only show products with stock > 0)
// - isActive: Only active products are shown to users by default
exports.getProducts = async (req, res) => {
  try {
    const { categoryId, subCategoryId, inStock } = req.query;

    // Build query - users only see active products
    const query = { isActive: true };

    // Filter by category
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Filter by subcategory
    if (subCategoryId) {
      query.subCategoryId = subCategoryId;
    }

    // Filter by stock availability
    if (inStock === 'true') {
      query.stock = { $gt: 0 }; // Stock greater than 0
    }

    // Get products with populated category and subcategory info
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// ============================================
// GET /api/products/categories
// ============================================
// Get all categories and subcategories for filtering
exports.getCategoriesForFilter = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const subCategories = await SubCategory.find()
      .populate('categoryId', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        categories,
        subCategories,
      },
    });
  } catch (error) {
    console.error('Get categories for filter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

// ============================================
// GET /api/products/:id
// ============================================
// Get single product details
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Users can only see active products
    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

