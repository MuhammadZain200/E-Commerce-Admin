// File: models/Cart.js
//
// Cart Model - Shopping cart for users before checkout
// Each user has one cart (created automatically)
// Cart items are cleared after order is placed

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Index for faster queries
cartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', cartSchema);

