// File: models/SubCategory.js
//
// SubCategory Model - Product subcategories (e.g., Laptops under Electronics)
// Managed by Admin only
// Each subcategory belongs to a category

const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
      maxlength: [100, 'Subcategory name cannot exceed 100 characters'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      // If false, subcategory is soft-deleted (hidden from users but visible to admin)
    },
  },
  { timestamps: true }
);

// Index for faster queries
subCategorySchema.index({ categoryId: 1 });
subCategorySchema.index({ name: 1, categoryId: 1 }, { unique: true }); // Unique subcategory per category

module.exports = mongoose.model('SubCategory', subCategorySchema);

