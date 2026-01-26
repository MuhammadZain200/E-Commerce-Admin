// File: pages/UserProducts.jsx
//
// User Products Page - Browse products with category/subcategory filters
// Redesigned to match the UI design

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProducts, getCategories } from '../api/userProducts';
import { addToCart } from '../api/cart';
import UserLayout from '../components/UserLayout';
import './UserProducts.css';

export default function UserProducts() {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categoryId: '',
    subCategoryId: '',
    inStock: false,
  });
  const [addingToCart, setAddingToCart] = useState({});
  const [displayCount, setDisplayCount] = useState(4); // Show 4 products initially

  useEffect(() => {
    loadCategories();
    loadProducts();
    // Refresh products every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadProducts();
    }, 5000);
    return () => clearInterval(interval);
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
        setSubCategories(response.data.subCategories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts(filters);
      if (response.success) {
        const productsData = response.data || [];
        setAllProducts(productsData);
        setProducts(productsData.slice(0, displayCount));
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Update displayed products when displayCount changes
    setProducts(allProducts.slice(0, displayCount));
  }, [displayCount, allProducts]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'categoryId') {
        newFilters.subCategoryId = '';
      }
      return newFilters;
    });
    setDisplayCount(4); // Reset display count when filters change
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      setAddingToCart({ ...addingToCart, [productId]: true });
      await addToCart(productId, 1);
      // Refresh cart count
      refreshCart();
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'cart-success-message';
      successMsg.textContent = `${productName} added to cart!`;
      document.body.appendChild(successMsg);
      setTimeout(() => {
        successMsg.remove();
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 4, allProducts.length));
  };

  const getFilteredSubCategories = () => {
    if (!filters.categoryId) return subCategories;
    return subCategories.filter((sub) => sub.categoryId._id === filters.categoryId);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'SOLD OUT', class: 'out-of-stock' };
    if (stock < 10) return { text: `${stock} available`, class: 'low-stock' };
    return { text: `${stock} available`, class: 'in-stock' };
  };

  if (loading && products.length === 0) {
    return (
      <UserLayout>
        <div className="loading-state">Loading products...</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="user-products-page">
        <div className="page-header">
          <h1 className="page-title">
            <span className="title-icon">🛍️</span>
            Browse Products
          </h1>
        </div>

        {/* Filters Section */}
        <div className="filters-card">
          <div className="filters-header">
            <span className="filter-icon">🔍</span>
            <h3>Filters</h3>
          </div>
          <div className="filters-content">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Subcategory:</label>
              <select
                value={filters.subCategoryId}
                onChange={(e) => handleFilterChange('subCategoryId', e.target.value)}
                disabled={!filters.categoryId}
              >
                <option value="">All Subcategories</option>
                {getFilteredSubCategories().map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                />
                In Stock Only
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Products Grid */}
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="empty-state">No products found</div>
          ) : (
            products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <div key={product._id} className={`product-card ${product.stock === 0 ? 'out-of-stock-card' : ''}`}>
                  {product.stock === 0 && (
                    <div className="out-of-stock-overlay">
                      <span>OUT OF STOCK</span>
                    </div>
                  )}
                  <div className="product-image">
                    <div className="product-image-placeholder">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                    {product.stock > 50 && (
                      <span className="product-badge badge-popular">Popular</span>
                    )}
                    {product.stock > 0 && product.stock < 20 && (
                      <span className="product-badge badge-organic">Organic</span>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-category">
                      {product.categoryId?.name?.toUpperCase()} / {product.subCategoryId?.name?.toUpperCase()}
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">${product.price.toFixed(2)}</div>
                    <div className={`product-stock ${stockStatus.class}`}>
                      {product.stock === 0 ? 'SOLD OUT' : `Stock: ${stockStatus.text}`}
                    </div>
                    <button
                      className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
                      onClick={() => handleAddToCart(product._id, product.name)}
                      disabled={product.stock === 0 || addingToCart[product._id]}
                    >
                      {addingToCart[product._id] ? (
                        'Adding...'
                      ) : product.stock === 0 ? (
                        'Not Available'
                      ) : (
                        <>
                          <span>Add to Cart</span>
                          <span className="cart-icon-btn">🛒</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More / Pagination */}
        {allProducts.length > displayCount && (
          <div className="pagination-section">
            <div className="pagination-info">
              Showing {products.length} of {allProducts.length} products
            </div>
            <button className="load-more-btn" onClick={handleLoadMore}>
              <span className="refresh-icon">🔄</span>
              Load More Products
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
