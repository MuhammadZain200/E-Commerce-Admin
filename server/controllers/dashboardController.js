// File: controllers/dashboardController.js

const Product = require('../models/Product');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get all products
    const products = await Product.find();

    // Calculate statistics
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const inactiveProducts = products.filter(p => !p.isActive).length;
    
    // Low stock threshold (products with stock < 10)
    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(p => p.stock < lowStockThreshold && p.isActive).length;
    
    // Calculate total inventory value (active products only)
    const totalInventoryValue = products
      .filter(p => p.isActive)
      .reduce((sum, p) => sum + (p.price * p.stock), 0);

    // Get products with zero stock
    const outOfStockProducts = products.filter(p => p.stock === 0 && p.isActive).length;

    // Get recent products (last 5 created)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price stock isActive createdAt');

    // Get low stock products for alerts
    const lowStockItems = await Product.find({
      stock: { $lt: lowStockThreshold },
      isActive: true
    })
      .sort({ stock: 1 })
      .limit(5)
      .select('name stock price');

    res.json({
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue: totalInventoryValue.toFixed(2),
      recentProducts,
      lowStockItems,
      // Placeholder for future order stats (will be added in Step 3)
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

module.exports = { getDashboardStats };

