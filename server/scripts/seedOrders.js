// Seed script to add dummy orders
// Run with: node server/scripts/seedOrders.js

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const seedOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Get existing products and users
    const products = await Product.find();
    const users = await User.find();

    if (products.length === 0) {
      console.log('❌ No products found. Please create products first.');
      process.exit(1);
    }

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      process.exit(1);
    }

    // Clear existing orders (optional - comment out if you want to keep existing orders)
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing orders');

    // Create dummy orders
    const dummyOrders = [
      {
        items: [
          {
            productId: products[0]._id,
            quantity: 2,
            price: products[0].price,
          },
          products.length > 1 ? {
            productId: products[1]._id,
            quantity: 1,
            price: products[1].price,
          } : null,
        ].filter(Boolean),
        totalAmount: (products[0].price * 2) + (products.length > 1 ? products[1].price : 0),
        status: 'created',
        paymentStatus: 'pending',
        createdBy: users[0]._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        items: [
          {
            productId: products[0]._id,
            quantity: 3,
            price: products[0].price,
          },
        ],
        totalAmount: products[0].price * 3,
        status: 'paid',
        paymentStatus: 'paid',
        createdBy: users[0]._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        items: [
          {
            productId: products.length > 1 ? products[1]._id : products[0]._id,
            quantity: 1,
            price: products.length > 1 ? products[1].price : products[0].price,
          },
        ],
        totalAmount: products.length > 1 ? products[1].price : products[0].price,
        status: 'packed',
        paymentStatus: 'paid',
        createdBy: users.length > 1 ? users[1]._id : users[0]._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        items: [
          {
            productId: products[0]._id,
            quantity: 5,
            price: products[0].price,
          },
          products.length > 1 ? {
            productId: products[1]._id,
            quantity: 2,
            price: products[1].price,
          } : null,
        ].filter(Boolean),
        totalAmount: (products[0].price * 5) + (products.length > 1 ? products[1].price * 2 : 0),
        status: 'shipped',
        paymentStatus: 'paid',
        createdBy: users[0]._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        items: [
          {
            productId: products[0]._id,
            quantity: 1,
            price: products[0].price,
          },
        ],
        totalAmount: products[0].price,
        status: 'delivered',
        paymentStatus: 'paid',
        createdBy: users.length > 1 ? users[1]._id : users[0]._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        items: [
          {
            productId: products.length > 1 ? products[1]._id : products[0]._id,
            quantity: 4,
            price: products.length > 1 ? products[1].price : products[0].price,
          },
        ],
        totalAmount: (products.length > 1 ? products[1].price : products[0].price) * 4,
        status: 'created',
        paymentStatus: 'pending',
        createdBy: users[0]._id,
        createdAt: new Date(), // Today
      },
    ];

    // Insert orders
    const createdOrders = await Order.insertMany(dummyOrders);
    console.log(`✅ Created ${createdOrders.length} dummy orders`);

    // Display summary
    console.log('\n📊 Order Summary:');
    console.log(`   Created: ${dummyOrders.filter(o => o.status === 'created').length}`);
    console.log(`   Paid: ${dummyOrders.filter(o => o.status === 'paid').length}`);
    console.log(`   Packed: ${dummyOrders.filter(o => o.status === 'packed').length}`);
    console.log(`   Shipped: ${dummyOrders.filter(o => o.status === 'shipped').length}`);
    console.log(`   Delivered: ${dummyOrders.filter(o => o.status === 'delivered').length}`);

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    process.exit(1);
  }
};

seedOrders();

