// File: controllers/categoryController.js
//
// Category Controller - Admin-only operations for managing categories and subcategories

const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// ============================================
// CATEGORY OPERATIONS (Admin only)
// ============================================

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const category = new Category({ name: name.trim() });
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

// ============================================
// SUBCATEGORY OPERATIONS (Admin only)
// ============================================

// Get all subcategories (optionally filtered by category)
exports.getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const query = categoryId ? { categoryId } : {};

    const subCategories = await SubCategory.find(query)
      .populate('categoryId', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
      error: error.message,
    });
  }
};

// Create subcategory
exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory name is required',
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required',
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const subCategory = new SubCategory({
      name: name.trim(),
      categoryId,
    });
    await subCategory.save();

    await subCategory.populate('categoryId', 'name');

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subCategory,
    });
  } catch (error) {
    console.error('Create subcategory error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory',
      error: error.message,
    });
  }
};

