// File: controllers/categoryController.js
//
// Category Controller - Admin-only operations for managing categories and subcategories

const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// ============================================
// CATEGORY OPERATIONS (Admin only)
// ============================================

// Get all categories (admin can see all, including inactive)
// Query param ?activeOnly=true to filter only active categories
exports.getCategories = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const query = activeOnly === 'true' ? { isActive: true } : {};
    const categories = await Category.find(query).sort({ name: 1 });
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

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Update fields
    category.name = name.trim();
    if (typeof isActive === 'boolean') {
      category.isActive = isActive;
    }

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};

// Soft-delete category (set isActive to false)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Soft delete: set isActive to false
    category.isActive = false;
    await category.save();

    // Also soft-delete all subcategories under this category
    await SubCategory.updateMany(
      { categoryId: id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Category disabled successfully',
      data: category,
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable category',
      error: error.message,
    });
  }
};

// ============================================
// SUBCATEGORY OPERATIONS (Admin only)
// ============================================

// Get all subcategories (optionally filtered by category)
// Query param ?activeOnly=true to filter only active subcategories
exports.getSubCategories = async (req, res) => {
  try {
    const { categoryId, activeOnly } = req.query;
    const query = categoryId ? { categoryId } : {};
    if (activeOnly === 'true') {
      query.isActive = true;
    }

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

    // Verify category exists and is active
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

// Update subcategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, isActive } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory name is required',
      });
    }

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    // If categoryId is being changed, verify new category exists
    if (categoryId && categoryId !== subCategory.categoryId.toString()) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
      subCategory.categoryId = categoryId;
    }

    // Update fields
    subCategory.name = name.trim();
    if (typeof isActive === 'boolean') {
      subCategory.isActive = isActive;
    }

    await subCategory.save();
    await subCategory.populate('categoryId', 'name');

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subCategory,
    });
  } catch (error) {
    console.error('Update subcategory error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update subcategory',
      error: error.message,
    });
  }
};

// Soft-delete subcategory (set isActive to false)
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    // Soft delete: set isActive to false
    subCategory.isActive = false;
    await subCategory.save();

    res.json({
      success: true,
      message: 'Subcategory disabled successfully',
      data: subCategory,
    });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable subcategory',
      error: error.message,
    });
  }
};

