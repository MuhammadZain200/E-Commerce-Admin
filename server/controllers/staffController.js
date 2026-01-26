// File: controllers/staffController.js
//
// Staff Controller - Operations for staff members
// Staff can view stock, restock products, and manage assigned orders

const Product = require('../models/Product');
const Order = require('../models/Order');

// ============================================
// PRODUCT STOCK MANAGEMENT (Staff)
// ============================================

// Get all products with stock information
exports.getProductsWithStock = async (req, res) => {
  try {
    // Staff can see all products (including inactive ones) for stock management
    const products = await Product.find()
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Get products with stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// Update product stock (restock)
exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update stock
    product.stock = stock;
    await product.save();

    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product stock',
      error: error.message,
    });
  }
};

// ============================================
// ORDER MANAGEMENT (Staff)
// ============================================

// Get orders assigned to staff member
exports.getAssignedOrders = async (req, res) => {
  try {
    const staffId = req.user.id;

    // Get orders assigned to this staff member
    const orders = await Order.find({ assignedStaffId: staffId })
      .populate('items.productId', 'name price')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get assigned orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned orders',
      error: error.message,
    });
  }
};

// Get all orders (staff can see all orders, not just assigned)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.productId', 'name price')
      .populate('createdBy', 'name email')
      .populate('assignedStaffId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Update order status (staff can update status for assigned orders)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Staff can only update orders assigned to them (unless admin)
    // Note: Admin check is done via roleMiddleware, so staff here means staff only
    if (order.assignedStaffId && order.assignedStaffId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders assigned to you',
      });
    }

    // Validate status transition (basic validation)
    const validStatuses = ['created', 'paid', 'packed', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Update status
    order.status = status;
    await order.save();

    await order.populate('items.productId', 'name price');
    await order.populate('createdBy', 'name email');
    await order.populate('assignedStaffId', 'name email');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

