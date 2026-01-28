// File: models/Category.js
//
// Category Model - Product categories (e.g., Electronics, Clothing, Books)
// Managed by Admin only

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
      // If false, category is soft-deleted (hidden from users but visible to admin)
    },
  },
  { timestamps: true }
);

// Index for faster queries
categorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', categorySchema);

