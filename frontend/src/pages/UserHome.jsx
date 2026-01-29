// File: pages/UserHome.jsx
//
// User Home Page - Dashboard with welcome, promotional banner, categories, and featured products

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { getProducts, getCategories } from '../api/userProducts';
import { addToCart } from '../api/cart';
import UserLayout from '../components/UserLayout';
import './UserHome.css';

// Module-level flag to prevent duplicate API calls across StrictMode remounts
// Set synchronously before async operations to prevent duplicate calls
let isFetchingHomeData = false;

export default function UserHome() {
  const { user } = useAuth();
  const { updateCartFromData } = useCart();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  
  // Component-level refs for tracking mount state
  const isMountedRef = useRef(true);
  const hasInitiatedFetchRef = useRef(false);

  useEffect(() => {
    console.log('[UserHome] Data fetch useEffect triggered', {
      isFetchingHomeData,
      hasInitiatedFetch: hasInitiatedFetchRef.current,
      hasCategories: categories.length > 0,
      hasProducts: featuredProducts.length > 0,
      user: user ? { id: user._id, role: user.role } : null,
      timestamp: new Date().toISOString()
    });

    // Guard 1: If we already have data, don't fetch again (handles StrictMode remount after fetch completes)
    if (categories.length > 0 || featuredProducts.length > 0) {
      console.log('[UserHome] API calls BLOCKED - already have data');
      setLoading(false);
      return;
    }

    // Guard 2: Prevent duplicate calls if already fetching (module-level check prevents StrictMode duplicates)
    if (isFetchingHomeData) {
      console.log('[UserHome] API calls BLOCKED - already fetching (module-level guard)');
      return;
    }
    
    console.log('[UserHome] API calls ALLOWED - fetching data');
    // Set module-level flag synchronously before any async operations
    // This prevents StrictMode remount from triggering duplicate call
    isFetchingHomeData = true;
    hasInitiatedFetchRef.current = true;
    isMountedRef.current = true;
    
    // Execute both API calls
    Promise.all([
      loadCategories(),
      loadFeaturedProducts()
    ]).finally(() => {
      // Reset module-level flag only after fetch completes
      // This allows fresh fetch when navigating back to home page
      isFetchingHomeData = false;
      console.log('[UserHome] All API calls completed');
    });

    // Cleanup: Only reset component-level flag
    // Don't reset module-level flag here - it prevents StrictMode duplicate calls
    // It will be reset after fetch completes, allowing fresh fetch on actual navigation
    return () => {
      isMountedRef.current = false;
    };
  }, []); // Empty deps: categories/products APIs are public, don't depend on user/auth

  const loadCategories = async () => {
    console.log('[UserHome] loadCategories() CALLED - making API request');
    try {
      const response = await getCategories();
      console.log('[UserHome] loadCategories() SUCCESS', {
        categoriesCount: response.data?.categories?.length || 0,
        timestamp: new Date().toISOString()
      });
      // Only update state if component is still mounted
      if (isMountedRef.current && response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error('[UserHome] loadCategories() FAILED:', err);
    }
  };

  const loadFeaturedProducts = async () => {
    console.log('[UserHome] loadFeaturedProducts() CALLED - making API request');
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      const response = await getProducts({});
      console.log('[UserHome] loadFeaturedProducts() SUCCESS', {
        productsCount: response.data?.length || 0,
        timestamp: new Date().toISOString()
      });
      // Only update state if component is still mounted
      if (isMountedRef.current && response.success) {
        const products = response.data || [];
        // Show first 8 products as featured
        setFeaturedProducts(products.slice(0, 8));
      }
    } catch (err) {
      console.error('[UserHome] loadFeaturedProducts() FAILED:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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
      const response = await addToCart(productId, 1);
      // Use cart data from response instead of making another API call
      if (response.success && response.data) {
        updateCartFromData(response.data);
      }
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
                    {product.stock === 0 && (
                      <div className="featured-stock-out">OUT OF STOCK</div>
                    )}
                    {product.stock > 0 && product.stock <= 10 && (
                      <div className="featured-stock-low">⚠️ Low Stock ({product.stock})</div>
                    )}
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

