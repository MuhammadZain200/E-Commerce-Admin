// File: pages/UserProductsList.jsx
//
// User Products List Page - Shows products filtered by category
// This is the actual product listing page

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { getProducts, getCategories } from '../api/userProducts';
import { addToCart } from '../api/cart';
import UserLayout from '../components/UserLayout';
import './UserProductsList.css';

export default function UserProductsList() {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('category') || '',
    subCategoryId: '',
    inStock: false,
  });
  const [addingToCart, setAddingToCart] = useState({});
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    // Removed automatic polling - products will only load when filters change
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
    setDisplayCount(12);
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

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 12, allProducts.length));
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

  const categoryIcons = {
    'Electronics': '💻',
    'Fashion': '👕',
    'Home & Living': '🏠',
    'Beauty': '✨',
  };

  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || '📦';
  };

  const selectedCategory = categories.find(cat => cat._id === filters.categoryId);

  if (loading && products.length === 0) {
    return (
      <UserLayout>
        <div className="products-list-page">
          <div className="loading-state">Loading products...</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="products-list-page">
        <div className="page-header">
          <div>
            <button className="back-btn" onClick={() => navigate('/user/products')}>
              ← Back to Categories
            </button>
            <h1 className="page-title">
              {selectedCategory ? `${selectedCategory.name} Products` : 'All Products'}
            </h1>
          </div>
        </div>

        {/* Category Buttons Section */}
        <div className="category-buttons-section">
          <div className="category-buttons-container">
            <button
              className={`category-filter-btn ${!filters.categoryId ? 'active' : ''}`}
              onClick={() => handleFilterChange('categoryId', '')}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                className={`category-filter-btn ${filters.categoryId === category._id ? 'active' : ''}`}
                onClick={() => handleFilterChange('categoryId', category._id)}
              >
                <span className="category-icon">{getCategoryIcon(category.name)}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-card">
          <div className="filters-header">
            <span className="filter-icon">🔍</span>
            <h3>Filters</h3>
          </div>
          <div className="filters-content">
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

