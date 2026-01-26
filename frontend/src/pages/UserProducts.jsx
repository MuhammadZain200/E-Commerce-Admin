// File: pages/UserProducts.jsx
//
// User Products Page - Browse products with category/subcategory filters

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories } from '../api/userProducts';
import { addToCart } from '../api/cart';
import UserNavbar from '../components/UserNavbar';
import './UserProducts.css';

export default function UserProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    loadCategories();
    loadProducts();
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
        setProducts(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      // Reset subcategory if category changes
      if (name === 'categoryId') {
        newFilters.subCategoryId = '';
      }
      return newFilters;
    });
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      setAddingToCart({ ...addingToCart, [productId]: true });
      await addToCart(productId, 1);
      alert(`${productName} added to cart!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  const getFilteredSubCategories = () => {
    if (!filters.categoryId) return subCategories;
    return subCategories.filter((sub) => sub.categoryId._id === filters.categoryId);
  };

  if (loading && products.length === 0) {
    return (
      <div className="user-products-page">
        <div className="loading-state">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="user-products-page">
      <UserNavbar />
      <h1>🛍️ Browse Products</h1>

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters">
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

          <div className="filter-group">
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
          products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-category">
                  {product.categoryId?.name} &gt; {product.subCategoryId?.name}
                </p>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <p className="product-stock">
                  Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </p>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product._id, product.name)}
                disabled={product.stock === 0 || addingToCart[product._id]}
              >
                {addingToCart[product._id] ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

