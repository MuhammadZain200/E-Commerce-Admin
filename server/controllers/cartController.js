// File: controllers/cartController.js
//
// Cart Controller - Shopping cart management for users
// Users can add/update/remove items from their cart

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

// ============================================
// GET /api/cart
// ============================================
// Get user's cart with product details
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find or create cart
    let cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Filter out inactive products and calculate totals
    const validItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.productId;
      
      // Only include active products with stock
      if (product && product.isActive && product.stock > 0) {
        // Update quantity if exceeds stock
        const quantity = Math.min(item.quantity, product.stock);
        const itemTotal = product.price * quantity;
        totalAmount += itemTotal;

        validItems.push({
          productId: product._id,
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock,
          },
          quantity,
          itemTotal,
        });
      }
    }

    // Update cart with valid items
    cart.items = validItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    await cart.save();

    // Get tax rate from settings (for display purposes)
    const settings = await Settings.getSettings();
    const taxRate = settings.taxRate || 0;
    const taxAmount = (totalAmount * taxRate) / 100;
    const totalWithTax = totalAmount + taxAmount;

    res.json({
      success: true,
      data: {
        items: validItems,
        totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimals
        taxRate: taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalWithTax: Math.round(totalWithTax * 100) / 100,
        itemCount: validItems.length,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message,
    });
  }
};

// ============================================
// POST /api/cart
// ============================================
// Add or update item in cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // Verify product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Available stock: ${product.stock}`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // Populate and return updated cart
    await cart.populate('items.productId', 'name price stock isActive');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    });
  }
};

// ============================================
// PUT /api/cart/:productId
// ============================================
// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    // Verify product stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate('items.productId', 'name price stock isActive');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
};

// ============================================
// DELETE /api/cart/:productId
// ============================================
// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Remove item
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message,
    });
  }
};

// ============================================
// DELETE /api/cart
// ============================================
// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
};

