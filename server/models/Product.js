// File: models/Product.js
//
// Product Model - Products in the e-commerce store
// Admin can create/update/delete products
// Staff can update stock
// Users can browse and purchase

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: [true, 'Subcategory is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      // If false, product is hidden from users but visible to staff/admin
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
productSchema.index({ categoryId: 1 });
productSchema.index({ subCategoryId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ stock: 1 }); // For low stock queries

module.exports = mongoose.model('Product', productSchema);
