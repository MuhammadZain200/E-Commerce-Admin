const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

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
const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Get settings to calculate tax
    const settings = await Settings.getSettings();

    // Validate items and check stock availability
    let subtotal = 0; // Amount before tax
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
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
    }

    // Calculate tax and total amount
    const taxAmount = (subtotal * settings.taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    // Create order
    const order = new Order({
      items: validatedItems,
      totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
      status: 'created',
      paymentStatus: 'pending',
      createdBy: userId,
    });

    await order.save();
    
    // Populate product details for response
    await order.populate('items.productId', 'name price stock');
    await order.populate('createdBy', 'name email');

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({ message: error.message });
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

    // If transitioning to 'paid', decrease stock atomically
    if (status === 'paid' && order.status === 'created') {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const stockUpdates = [];
        const originalStocks = [];

        // First pass: validate all stock and prepare updates
        for (const item of order.items) {
          const product = await Product.findById(item.productId).session(session);
          
          if (!product) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: `Product ${item.productId} not found` });
          }

          if (product.stock < item.quantity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
              message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}` 
            });
          }

          // Store original stock for rollback
          originalStocks.push({
            productId: product._id,
            originalStock: product.stock
          });

          // Prepare stock update
          stockUpdates.push({
            updateOne: {
              filter: { _id: product._id, stock: { $gte: item.quantity } },
              update: { $inc: { stock: -item.quantity } }
            }
          });
        }

        // Atomic bulk update - only succeeds if all products have sufficient stock
        if (stockUpdates.length > 0) {
          const bulkResult = await Product.bulkWrite(stockUpdates, { session });
          
          // Verify all updates succeeded
          if (bulkResult.modifiedCount !== stockUpdates.length) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
              message: 'Stock update failed. One or more products may have insufficient stock.' 
            });
          }
        }

        // Update payment status and order status
        order.paymentStatus = 'paid';
        order.status = status;
        await order.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();
        
        // Populate for response
        await order.populate('items.productId', 'name price stock');
        await order.populate('createdBy', 'name email');
        
        return res.json(order);
      } catch (error) {
        // Rollback on any error
        await session.abortTransaction();
        session.endSession();
        console.error('Stock update error (rolled back):', error);
        return res.status(500).json({ 
          message: 'Failed to update stock. Transaction rolled back.',
          error: error.message 
        });
      }
    } else {
      // Update order status (for non-paid transitions)
      order.status = status;
      await order.save();
    }

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

    // Admin and staff can see all orders, users can only see their own
    const query = userRole === 'admin' || userRole === 'staff' 
      ? {} 
      : { createdBy: userId };

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name price stock')
      .populate('createdBy', 'name email');

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
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
      return res.status(404).json({ message: 'Order not found' });
    }

    // Users can only view their own orders (unless admin/staff)
    if (userRole !== 'admin' && userRole !== 'staff' && order.createdBy._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrders,
  getOrderById,
};

