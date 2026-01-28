const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Cart = require('../models/Cart');

// Valid status transitions (sequential flow)
const STATUS_TRANSITIONS = {
  created: ['paid'],
  paid: ['packed'],
  packed: ['shipped'],
  shipped: ['delivered'],
  delivered: [], // Final state
};

// All possible statuses (for skipping validation)
const ALL_STATUSES = ['created', 'paid', 'packed', 'shipped', 'delivered'];

// Validate status transition
// If allowStatusSkipping is true, any status transition is allowed (except to delivered from created)
// If false, only sequential transitions are allowed
const isValidTransition = (currentStatus, newStatus, allowStatusSkipping = false) => {
  // Delivered is always final
  if (currentStatus === 'delivered') {
    return false;
  }
  
  // If skipping is allowed, allow any transition except delivered from created
  if (allowStatusSkipping) {
    if (currentStatus === 'created' && newStatus === 'delivered') {
      return false; // Can't skip directly to delivered
    }
    return ALL_STATUSES.includes(newStatus);
  }
  
  // Otherwise, only allow sequential transitions
  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

// Create order
// Uses atomic operations instead of transactions for standalone MongoDB compatibility
const createOrder = async (req, res) => {
  let createdOrder = null;

  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Get settings to calculate tax
    const settings = await Settings.getSettings();

    // First pass: validate all items and check stock availability
    let subtotal = 0;
    const validatedItems = [];
    const stockUpdates = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isActive) {
        return res.status(400).json({ 
          message: `Product ${product.name} is not available` 
        });
      }

      if (product.stock <= 0) {
        return res.status(400).json({ 
          message: `Product ${product.name} is out of stock` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      // Use current product price (not the price from request, to prevent price manipulation)
      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: itemPrice,
      });

      // Prepare stock update with current stock for atomic check
      stockUpdates.push({
        productId: product._id,
        quantity: item.quantity,
        currentStock: product.stock,
      });
    }

    // Calculate tax and total amount
    const taxAmount = (subtotal * settings.taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Create order first
    const order = new Order({
      items: validatedItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'created',
      paymentStatus: 'pending',
      createdBy: userId,
    });

    createdOrder = await order.save();

    // Atomically decrement stock for all products using findOneAndUpdate with conditions
    // This ensures stock is only decremented if it's still sufficient
    const stockUpdateResults = [];
    for (const update of stockUpdates) {
      // Use findOneAndUpdate with condition to atomically check and decrement stock
      const result = await Product.findOneAndUpdate(
        {
          _id: update.productId,
          stock: { $gte: update.quantity }, // Only update if stock is still sufficient
        },
        { $inc: { stock: -update.quantity } },
        { new: true }
      );

      if (!result) {
        // Stock was insufficient - rollback order
        await Order.findByIdAndDelete(createdOrder._id);
        return res.status(400).json({
          message: `Insufficient stock detected during order processing. Please try again.`,
        });
      }

      stockUpdateResults.push(result);
    }

    // Populate product details for response
    await order.populate('items.productId', 'name price stock');
    await order.populate('createdBy', 'name email');

    res.status(201).json(order);
  } catch (error) {
    // Rollback order if it was created
    if (createdOrder) {
      try {
        await Order.findByIdAndDelete(createdOrder._id);
      } catch (rollbackError) {
        console.error('Error rolling back order:', rollbackError);
      }
    }

    console.error('Create order error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to create order' 
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get settings to check order rules
    const settings = await Settings.getSettings();

    // Check if order is paid and editing is not allowed
    if (order.paymentStatus === 'paid' && !settings.allowEditingPaidOrders) {
      return res.status(400).json({ 
        message: 'Cannot modify paid orders. Editing paid orders is disabled in settings.' 
      });
    }

    // Check if status transition is valid (respect allowStatusSkipping setting)
    if (!isValidTransition(order.status, status, settings.allowStatusSkipping)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${order.status} to ${status}. Status skipping is ${settings.allowStatusSkipping ? 'allowed' : 'not allowed'}.` 
      });
    }

    // Note: Stock is decremented when order is created (in createOrder function)
    // So we don't need to decrement stock here when status changes to 'paid'
    // This prevents double-decrementing and works with standalone MongoDB
    
    // If transitioning to 'paid', update payment status
    if (status === 'paid') {
      order.paymentStatus = 'paid';
    }
    
    // Update order status
    order.status = status;
    await order.save();

    // Populate for response
    await order.populate('items.productId', 'name price stock');
    await order.populate('createdBy', 'name email');

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin can see all orders, users can only see their own
    const query = userRole === 'admin'
      ? {}
      : { createdBy: userId };

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name price stock')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders' 
    });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(id)
      .populate('items.productId', 'name price stock')
      .populate('createdBy', 'name email');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Users can only view their own orders (unless admin)
    if (userRole !== 'admin' && order.createdBy._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// ============================================
// Checkout from cart (User)
// ============================================
// Creates order from cart and clears cart
// Uses atomic operations instead of transactions for standalone MongoDB compatibility
const checkoutFromCart = async (req, res) => {
  let createdOrder = null;
  let cartToRestore = null;

  try {
    const userId = req.user.id;

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Save cart state for potential rollback
    cartToRestore = JSON.parse(JSON.stringify(cart.items));

    // Get settings for tax calculation
    const settings = await Settings.getSettings();

    // Validate items and check stock
    let subtotal = 0;
    const validatedItems = [];
    const stockUpdates = [];

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId._id);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product?.name || 'Unknown'} is no longer available`,
        });
      }

      if (product.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is out of stock`,
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`,
        });
      }

      const itemPrice = product.price;
      const itemTotal = itemPrice * cartItem.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        quantity: cartItem.quantity,
        price: itemPrice,
      });

      // Prepare stock update with current stock for atomic check
      stockUpdates.push({
        productId: product._id,
        quantity: cartItem.quantity,
        currentStock: product.stock,
      });
    }

    // Calculate tax and total
    const taxAmount = (subtotal * settings.taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Create order
    const order = new Order({
      items: validatedItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'created',
      paymentStatus: 'pending',
      createdBy: userId,
    });

    createdOrder = await order.save();

    // Atomically decrement stock for all products using findOneAndUpdate with conditions
    for (const update of stockUpdates) {
      const result = await Product.findOneAndUpdate(
        {
          _id: update.productId,
          stock: { $gte: update.quantity }, // Only update if stock is still sufficient
        },
        { $inc: { stock: -update.quantity } },
        { new: true }
      );

      if (!result) {
        // Stock was insufficient - rollback order and restore cart
        await Order.findByIdAndDelete(createdOrder._id);
        cart.items = cartToRestore;
        await cart.save();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock detected during checkout. Please try again.`,
        });
      }
    }

    // Clear cart after successful order creation and stock updates
    cart.items = [];
    await cart.save();

    // Populate for response
    await order.populate('items.productId', 'name price stock');
    await order.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    // Rollback order if it was created
    if (createdOrder) {
      try {
        await Order.findByIdAndDelete(createdOrder._id);
      } catch (rollbackError) {
        console.error('Error rolling back order:', rollbackError);
      }
    }

    // Restore cart if it was modified
    if (cartToRestore) {
      try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
          cart.items = cartToRestore;
          await cart.save();
        }
      } catch (rollbackError) {
        console.error('Error restoring cart:', rollbackError);
      }
    }

    console.error('Checkout from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order from cart',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  checkoutFromCart,
  updateOrderStatus,
  getOrders,
  getOrderById,
};

