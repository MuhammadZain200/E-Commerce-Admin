// Seed script to add categories, subcategories, and products
// Run with: node server/scripts/seedCategoriesAndProducts.js

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');

const seedCategoriesAndProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    await SubCategory.deleteMany({});
    console.log('🗑️  Cleared existing subcategories');
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Create Categories
    const categoriesData = [
      { name: 'Electronics' },
      { name: 'Fashion' },
      { name: 'Home & Living' },
      { name: 'Beauty' },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create Subcategories
    const electronics = createdCategories.find(c => c.name === 'Electronics');
    const fashion = createdCategories.find(c => c.name === 'Fashion');
    const homeLiving = createdCategories.find(c => c.name === 'Home & Living');
    const beauty = createdCategories.find(c => c.name === 'Beauty');

    const subCategoriesData = [
      // Electronics subcategories
      { name: 'Laptops', categoryId: electronics._id },
      { name: 'Smartphones', categoryId: electronics._id },
      { name: 'Headphones', categoryId: electronics._id },
      { name: 'Tablets', categoryId: electronics._id },
      { name: 'Smart Watches', categoryId: electronics._id },
      
      // Fashion subcategories
      { name: 'Men\'s Clothing', categoryId: fashion._id },
      { name: 'Women\'s Clothing', categoryId: fashion._id },
      { name: 'Shoes', categoryId: fashion._id },
      { name: 'Accessories', categoryId: fashion._id },
      { name: 'Bags', categoryId: fashion._id },
      
      // Home & Living subcategories
      { name: 'Furniture', categoryId: homeLiving._id },
      { name: 'Decor', categoryId: homeLiving._id },
      { name: 'Kitchen', categoryId: homeLiving._id },
      { name: 'Bedding', categoryId: homeLiving._id },
      { name: 'Lighting', categoryId: homeLiving._id },
      
      // Beauty subcategories
      { name: 'Skincare', categoryId: beauty._id },
      { name: 'Makeup', categoryId: beauty._id },
      { name: 'Fragrance', categoryId: beauty._id },
      { name: 'Hair Care', categoryId: beauty._id },
      { name: 'Body Care', categoryId: beauty._id },
    ];

    const createdSubCategories = await SubCategory.insertMany(subCategoriesData);
    console.log(`✅ Created ${createdSubCategories.length} subcategories`);

    // Helper function to find subcategory by name
    const findSubCategory = (name) => {
      return createdSubCategories.find(sc => sc.name === name);
    };

    // Create Products
    const productsData = [
      // Electronics - Laptops
      { name: 'MacBook Pro 16"', price: 2499.99, stock: 15, categoryId: electronics._id, subCategoryId: findSubCategory('Laptops')._id },
      { name: 'Dell XPS 15', price: 1899.99, stock: 20, categoryId: electronics._id, subCategoryId: findSubCategory('Laptops')._id },
      { name: 'HP Spectre x360', price: 1299.99, stock: 12, categoryId: electronics._id, subCategoryId: findSubCategory('Laptops')._id },
      { name: 'Lenovo ThinkPad X1', price: 1599.99, stock: 8, categoryId: electronics._id, subCategoryId: findSubCategory('Laptops')._id },
      
      // Electronics - Smartphones
      { name: 'iPhone 15 Pro', price: 999.99, stock: 25, categoryId: electronics._id, subCategoryId: findSubCategory('Smartphones')._id },
      { name: 'Samsung Galaxy S24', price: 899.99, stock: 18, categoryId: electronics._id, subCategoryId: findSubCategory('Smartphones')._id },
      { name: 'Google Pixel 8', price: 699.99, stock: 22, categoryId: electronics._id, subCategoryId: findSubCategory('Smartphones')._id },
      { name: 'OnePlus 12', price: 799.99, stock: 14, categoryId: electronics._id, subCategoryId: findSubCategory('Smartphones')._id },
      
      // Electronics - Headphones
      { name: 'Sony WH-1000XM5', price: 399.99, stock: 30, categoryId: electronics._id, subCategoryId: findSubCategory('Headphones')._id },
      { name: 'AirPods Pro 2', price: 249.99, stock: 35, categoryId: electronics._id, subCategoryId: findSubCategory('Headphones')._id },
      { name: 'Bose QuietComfort 45', price: 329.99, stock: 20, categoryId: electronics._id, subCategoryId: findSubCategory('Headphones')._id },
      
      // Electronics - Tablets
      { name: 'iPad Pro 12.9"', price: 1099.99, stock: 15, categoryId: electronics._id, subCategoryId: findSubCategory('Tablets')._id },
      { name: 'Samsung Galaxy Tab S9', price: 799.99, stock: 12, categoryId: electronics._id, subCategoryId: findSubCategory('Tablets')._id },
      
      // Electronics - Smart Watches
      { name: 'Apple Watch Series 9', price: 399.99, stock: 28, categoryId: electronics._id, subCategoryId: findSubCategory('Smart Watches')._id },
      { name: 'Samsung Galaxy Watch 6', price: 299.99, stock: 22, categoryId: electronics._id, subCategoryId: findSubCategory('Smart Watches')._id },
      
      // Fashion - Men's Clothing
      { name: 'Classic White Dress Shirt', price: 79.99, stock: 45, categoryId: fashion._id, subCategoryId: findSubCategory('Men\'s Clothing')._id },
      { name: 'Slim Fit Jeans', price: 89.99, stock: 38, categoryId: fashion._id, subCategoryId: findSubCategory('Men\'s Clothing')._id },
      { name: 'Cotton T-Shirt Pack', price: 39.99, stock: 50, categoryId: fashion._id, subCategoryId: findSubCategory('Men\'s Clothing')._id },
      { name: 'Wool Blazer', price: 199.99, stock: 15, categoryId: fashion._id, subCategoryId: findSubCategory('Men\'s Clothing')._id },
      
      // Fashion - Women's Clothing
      { name: 'Floral Summer Dress', price: 69.99, stock: 42, categoryId: fashion._id, subCategoryId: findSubCategory('Women\'s Clothing')._id },
      { name: 'High-Waisted Leggings', price: 49.99, stock: 55, categoryId: fashion._id, subCategoryId: findSubCategory('Women\'s Clothing')._id },
      { name: 'Silk Blouse', price: 89.99, stock: 28, categoryId: fashion._id, subCategoryId: findSubCategory('Women\'s Clothing')._id },
      { name: 'Denim Jacket', price: 79.99, stock: 32, categoryId: fashion._id, subCategoryId: findSubCategory('Women\'s Clothing')._id },
      
      // Fashion - Shoes
      { name: 'Leather Oxford Shoes', price: 149.99, stock: 25, categoryId: fashion._id, subCategoryId: findSubCategory('Shoes')._id },
      { name: 'Running Sneakers', price: 119.99, stock: 40, categoryId: fashion._id, subCategoryId: findSubCategory('Shoes')._id },
      { name: 'High Heel Pumps', price: 99.99, stock: 30, categoryId: fashion._id, subCategoryId: findSubCategory('Shoes')._id },
      { name: 'Casual Loafers', price: 79.99, stock: 35, categoryId: fashion._id, subCategoryId: findSubCategory('Shoes')._id },
      
      // Fashion - Accessories
      { name: 'Leather Belt', price: 49.99, stock: 50, categoryId: fashion._id, subCategoryId: findSubCategory('Accessories')._id },
      { name: 'Silk Scarf', price: 39.99, stock: 45, categoryId: fashion._id, subCategoryId: findSubCategory('Accessories')._id },
      { name: 'Designer Sunglasses', price: 199.99, stock: 20, categoryId: fashion._id, subCategoryId: findSubCategory('Accessories')._id },
      
      // Fashion - Bags
      { name: 'Leather Handbag', price: 249.99, stock: 18, categoryId: fashion._id, subCategoryId: findSubCategory('Bags')._id },
      { name: 'Backpack', price: 89.99, stock: 30, categoryId: fashion._id, subCategoryId: findSubCategory('Bags')._id },
      { name: 'Tote Bag', price: 59.99, stock: 40, categoryId: fashion._id, subCategoryId: findSubCategory('Bags')._id },
      
      // Home & Living - Furniture
      { name: 'Modern Sofa', price: 1299.99, stock: 5, categoryId: homeLiving._id, subCategoryId: findSubCategory('Furniture')._id },
      { name: 'Dining Table Set', price: 899.99, stock: 8, categoryId: homeLiving._id, subCategoryId: findSubCategory('Furniture')._id },
      { name: 'Office Desk', price: 399.99, stock: 12, categoryId: homeLiving._id, subCategoryId: findSubCategory('Furniture')._id },
      { name: 'Bookshelf', price: 249.99, stock: 15, categoryId: homeLiving._id, subCategoryId: findSubCategory('Furniture')._id },
      
      // Home & Living - Decor
      { name: 'Wall Art Set', price: 79.99, stock: 25, categoryId: homeLiving._id, subCategoryId: findSubCategory('Decor')._id },
      { name: 'Vase Collection', price: 49.99, stock: 30, categoryId: homeLiving._id, subCategoryId: findSubCategory('Decor')._id },
      { name: 'Throw Pillows Set', price: 39.99, stock: 40, categoryId: homeLiving._id, subCategoryId: findSubCategory('Decor')._id },
      { name: 'Mirror', price: 129.99, stock: 18, categoryId: homeLiving._id, subCategoryId: findSubCategory('Decor')._id },
      
      // Home & Living - Kitchen
      { name: 'Cookware Set', price: 199.99, stock: 20, categoryId: homeLiving._id, subCategoryId: findSubCategory('Kitchen')._id },
      { name: 'Coffee Maker', price: 149.99, stock: 25, categoryId: homeLiving._id, subCategoryId: findSubCategory('Kitchen')._id },
      { name: 'Blender', price: 89.99, stock: 30, categoryId: homeLiving._id, subCategoryId: findSubCategory('Kitchen')._id },
      { name: 'Dinnerware Set', price: 79.99, stock: 35, categoryId: homeLiving._id, subCategoryId: findSubCategory('Kitchen')._id },
      
      // Home & Living - Bedding
      { name: 'Luxury Bedding Set', price: 149.99, stock: 22, categoryId: homeLiving._id, subCategoryId: findSubCategory('Bedding')._id },
      { name: 'Memory Foam Pillow', price: 49.99, stock: 45, categoryId: homeLiving._id, subCategoryId: findSubCategory('Bedding')._id },
      { name: 'Comforter Set', price: 119.99, stock: 28, categoryId: homeLiving._id, subCategoryId: findSubCategory('Bedding')._id },
      
      // Home & Living - Lighting
      { name: 'Table Lamp', price: 69.99, stock: 30, categoryId: homeLiving._id, subCategoryId: findSubCategory('Lighting')._id },
      { name: 'Chandelier', price: 299.99, stock: 10, categoryId: homeLiving._id, subCategoryId: findSubCategory('Lighting')._id },
      { name: 'LED Strip Lights', price: 29.99, stock: 50, categoryId: homeLiving._id, subCategoryId: findSubCategory('Lighting')._id },
      
      // Beauty - Skincare
      { name: 'Vitamin C Serum', price: 39.99, stock: 50, categoryId: beauty._id, subCategoryId: findSubCategory('Skincare')._id },
      { name: 'Moisturizing Cream', price: 29.99, stock: 60, categoryId: beauty._id, subCategoryId: findSubCategory('Skincare')._id },
      { name: 'Face Cleanser', price: 24.99, stock: 55, categoryId: beauty._id, subCategoryId: findSubCategory('Skincare')._id },
      { name: 'Sunscreen SPF 50', price: 19.99, stock: 65, categoryId: beauty._id, subCategoryId: findSubCategory('Skincare')._id },
      
      // Beauty - Makeup
      { name: 'Foundation', price: 34.99, stock: 45, categoryId: beauty._id, subCategoryId: findSubCategory('Makeup')._id },
      { name: 'Lipstick Set', price: 29.99, stock: 50, categoryId: beauty._id, subCategoryId: findSubCategory('Makeup')._id },
      { name: 'Eyeshadow Palette', price: 49.99, stock: 35, categoryId: beauty._id, subCategoryId: findSubCategory('Makeup')._id },
      { name: 'Mascara', price: 24.99, stock: 55, categoryId: beauty._id, subCategoryId: findSubCategory('Makeup')._id },
      
      // Beauty - Fragrance
      { name: 'Eau de Parfum', price: 89.99, stock: 30, categoryId: beauty._id, subCategoryId: findSubCategory('Fragrance')._id },
      { name: 'Body Spray', price: 19.99, stock: 60, categoryId: beauty._id, subCategoryId: findSubCategory('Fragrance')._id },
      { name: 'Perfume Gift Set', price: 129.99, stock: 20, categoryId: beauty._id, subCategoryId: findSubCategory('Fragrance')._id },
      
      // Beauty - Hair Care
      { name: 'Shampoo & Conditioner Set', price: 24.99, stock: 50, categoryId: beauty._id, subCategoryId: findSubCategory('Hair Care')._id },
      { name: 'Hair Mask', price: 19.99, stock: 45, categoryId: beauty._id, subCategoryId: findSubCategory('Hair Care')._id },
      { name: 'Hair Serum', price: 29.99, stock: 40, categoryId: beauty._id, subCategoryId: findSubCategory('Hair Care')._id },
      
      // Beauty - Body Care
      { name: 'Body Lotion', price: 19.99, stock: 60, categoryId: beauty._id, subCategoryId: findSubCategory('Body Care')._id },
      { name: 'Body Scrub', price: 24.99, stock: 45, categoryId: beauty._id, subCategoryId: findSubCategory('Body Care')._id },
      { name: 'Hand Cream', price: 14.99, stock: 70, categoryId: beauty._id, subCategoryId: findSubCategory('Body Care')._id },
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Subcategories: ${createdSubCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    
    console.log('\n📦 Products by Category:');
    createdCategories.forEach(category => {
      const count = createdProducts.filter(p => p.categoryId.toString() === category._id.toString()).length;
      console.log(`   ${category.name}: ${count} products`);
    });

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedCategoriesAndProducts();

