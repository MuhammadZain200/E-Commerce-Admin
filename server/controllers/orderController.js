const Order = require('../models/Order');
const Product = require('../models/Product');

// Valid status transitions
const STATUS_TRANSITIONS = {
  created: ['paid'],
  paid: ['packed'],
  packed: ['shipped'],
  shipped: ['delivered'],
  delivered: [], // Final state
};

// Validate status transition
const isValidTransition = (currentStatus, newStatus) => {
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

    // Validate items and check stock availability
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is not active` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      // Use current product price (not the price from request, to prevent price manipulation)
      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // Create order
    const order = new Order({
      items: validatedItems,
      totalAmount,
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

    // Check if status transition is valid
    if (!isValidTransition(order.status, status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    // If transitioning to 'paid', decrease stock
    if (status === 'paid' && order.status === 'created') {
      // Use transaction-like approach (check stock again before decrementing)
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for product. Available: ${product.stock}, Required: ${item.quantity}` 
          });
        }

        // Decrease stock
        product.stock -= item.quantity;
        await product.save();
      }

      // Update payment status
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

