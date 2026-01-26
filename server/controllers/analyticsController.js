const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Get analytics data for admin dashboard
 * Calculates:
 * - Total sales (sum of totalAmount for orders with status: paid, packed, shipped, delivered)
 * - Pending orders (count of orders with status: created or paid)
 * - Top 5 selling products (sum of quantity sold per product)
 */
const getAnalytics = async (req, res) => {
  try {
    // 1. Calculate Total Sales
    // Sum of totalAmount for orders with status: paid, packed, shipped, delivered
    const totalSalesResult = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'packed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // 2. Calculate Pending Orders
    // Count of orders with status: created or paid
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['created', 'paid'] }
    });

    // 3. Calculate Top 5 Selling Products
    // Aggregate pipeline to:
    // - Unwind order items array
    // - Match only orders with status: paid, packed, shipped, delivered (completed orders)
    // - Group by productId and sum quantities
    // - Sort by total quantity descending
    // - Limit to top 5
    // - Lookup product details to get product name
    const topProductsResult = await Order.aggregate([
      // Match only completed orders (where products were actually sold)
      {
        $match: {
          status: { $in: ['paid', 'packed', 'shipped', 'delivered'] }
        }
      },
      // Unwind the items array to process each item separately
      {
        $unwind: '$items'
      },
      // Group by productId and sum the quantities
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      // Sort by total quantity in descending order
      {
        $sort: { totalQuantity: -1 }
      },
      // Limit to top 5
      {
        $limit: 5
      },
      // Lookup product details to get the product name
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      // Unwind the product array (should be single element)
      {
        $unwind: '$product'
      },
      // Project only the fields we need
      {
        $project: {
          _id: 0,
          name: '$product.name',
          totalQuantity: 1
        }
      }
    ]);

    // Format the response
    const analytics = {
      totalSales: totalSales,
      pendingOrders: pendingOrders,
      topProducts: topProductsResult.map(product => ({
        name: product.name,
        totalQuantity: product.totalQuantity
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch analytics data',
      error: error.message 
    });
  }
};

module.exports = {
  getAnalytics
};

