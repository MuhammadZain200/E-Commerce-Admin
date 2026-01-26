// File: controllers/dashboardController.js

const Product = require('../models/Product');
const Order = require('../models/Order');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get all products
    const products = await Product.find();

    // Calculate statistics
    const totalProducts = products.length;
    
    // Low stock threshold (products with stock < 10)
    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(p => p.stock < lowStockThreshold).length;
    
    // Calculate total inventory value
    const totalInventoryValue = products
      .reduce((sum, p) => sum + (p.price * p.stock), 0);

    // Get products with zero stock
    const outOfStockProducts = products.filter(p => p.stock === 0).length;

    // Get recent products (last 5 created)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price stock createdAt');

    // Get low stock products for alerts
    const lowStockItems = await Product.find({
      stock: { $lt: lowStockThreshold }
    })
      .sort({ stock: 1 })
      .limit(5)
      .select('name stock price');

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['created', 'paid', 'packed', 'shipped'] } 
    });
    
    // Calculate total revenue from delivered orders
    const deliveredOrders = await Order.find({ status: 'delivered' })
      .select('totalAmount');
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue: totalInventoryValue.toFixed(2),
      recentProducts,
      lowStockItems,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue.toFixed(2),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

module.exports = { getDashboardStats };

