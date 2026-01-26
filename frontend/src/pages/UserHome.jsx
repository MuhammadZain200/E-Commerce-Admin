// File: pages/UserHome.jsx
//
// User Home Page - Dashboard with welcome, promotional banner, categories, and featured products

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { getProducts, getCategories } from '../api/userProducts';
import { addToCart } from '../api/cart';
import UserLayout from '../components/UserLayout';
import './UserHome.css';

export default function UserHome() {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    loadCategories();
    loadFeaturedProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({});
      if (response.success) {
        const products = response.data || [];
        // Show first 8 products as featured
        setFeaturedProducts(products.slice(0, 8));
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'all') {
      navigate('/user/products-list');
    } else {
      // Find category by ID or name
      const category = categories.find(c => c._id === categoryId || c.name === categoryId);
      if (category) {
        navigate(`/user/products-list?category=${category._id}`);
      } else {
        navigate('/user/products-list');
      }
    }
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      setAddingToCart({ ...addingToCart, [productId]: true });
      await addToCart(productId, 1);
      refreshCart();
      success(`${productName} added to cart!`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  const categoryIcons = {
    'Electronics': '💻',
    'Fashion': '👕',
    'Home & Living': '🏠',
    'Beauty': '✨',
  };

  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || '📦';
  };

  return (
    <UserLayout>
      <div className="user-home-page">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">
            Hi, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="welcome-subtitle">
            Curated selections just for your lifestyle.
          </p>
        </div>

        {/* Promotional Banner */}
        <div className="promo-banner">
          <div className="promo-tag">NEW COLLECTION</div>
          <h2 className="promo-title">Elevate Your Living Space</h2>
          <p className="promo-description">
            Discover our new Signature Line - where contemporary artistry meets unparalleled comfort.
          </p>
          <div className="promo-buttons">
            <button 
              className="promo-btn primary"
              onClick={() => navigate('/user/products-list')}
            >
              Shop the Collection
            </button>
            <button className="promo-btn secondary">
              View Lookbook
            </button>
          </div>
        </div>

        {/* Shop by Category Section */}
        <div className="category-section">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <button 
              className="explore-all-btn"
              onClick={() => navigate('/user/products-list')}
            >
              Explore All →
            </button>
          </div>
          <div className="category-buttons">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('all')}
            >
              All Products
            </button>
            {categories.slice(0, 4).map((category) => (
              <button
                key={category._id}
                className={`category-btn ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(category._id);
                  handleCategoryClick(category._id);
                }}
              >
                <span className="category-icon">{getCategoryIcon(category.name)}</span>
                {category.name}
              </button>
            ))}
            {categories.length > 4 && (
              <button 
                className="category-btn"
                onClick={() => navigate('/user/products')}
              >
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        {/* Featured Selections Section */}
        <div className="featured-section">
          <div className="section-header">
            <h2 className="section-title">Featured Selections</h2>
            <button className="filter-icon-btn">⚙️</button>
          </div>
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : featuredProducts.length === 0 ? (
            <div className="empty-state">No featured products available</div>
          ) : (
            <div className="featured-grid">
              {featuredProducts.map((product) => (
                <div key={product._id} className="featured-card">
                  <div className="featured-image">
                    <div className="featured-image-placeholder">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                    {product.stock > 0 && (
                      <button
                        className="featured-cart-btn"
                        onClick={() => handleAddToCart(product._id, product.name)}
                        disabled={product.stock === 0 || addingToCart[product._id]}
                      >
                        {addingToCart[product._id] ? '...' : '🛒'}
                      </button>
                    )}
                  </div>
                  <div className="featured-info">
                    <div className="featured-category">
                      {product.categoryId?.name}
                    </div>
                    <h3 className="featured-name">{product.name}</h3>
                    <div className="featured-price">${product.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}

