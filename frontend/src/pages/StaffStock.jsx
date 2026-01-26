// File: pages/StaffStock.jsx
//
// Staff Stock Management Page - View and update product stock

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getProductsWithStock, updateProductStock } from '../api/staff';
import './StaffStock.css';

export default function StaffStock() {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [editStock, setEditStock] = useState({});

  useEffect(() => {
    loadProducts();
    // Refresh products every 5 seconds for real-time updates
    const interval = setInterval(loadProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProductsWithStock();
      // Handle different response formats
      const productsData = response.success 
        ? (response.data || [])
        : (Array.isArray(response.data) ? response.data : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      setUpdating({ ...updating, [productId]: true });
      await updateProductStock(productId, newStock);
      await loadProducts(); // Reload products
      setEditStock({ ...editStock, [productId]: false });
      success('Stock updated successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdating({ ...updating, [productId]: false });
    }
  };

  const getStockStatusClass = (stock) => {
    if (stock === 0) return 'stock-out';
    if (stock < 10) return 'stock-low';
    return 'stock-ok';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="loading-state">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar />
        <div className="staff-stock-page">
          <h1>📦 Stock Management</h1>

          {error && <div className="error-message">{error}</div>}

          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className={!product.isActive ? 'row-inactive' : ''}>
                      <td>
                        <strong>{product.name}</strong>
                        {!product.isActive && <span className="inactive-badge">Inactive</span>}
                      </td>
                      <td>
                        {product.categoryId?.name} &gt; {product.subCategoryId?.name}
                      </td>
                      <td>
                        {editStock[product._id] ? (
                          <input
                            type="number"
                            min="0"
                            defaultValue={product.stock}
                            onBlur={(e) => {
                              const newStock = parseInt(e.target.value) || 0;
                              if (newStock !== product.stock) {
                                handleStockUpdate(product._id, newStock);
                              } else {
                                setEditStock({ ...editStock, [product._id]: false });
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            autoFocus
                            className="stock-input"
                          />
                        ) : (
                          <span
                            className={`stock-value ${getStockStatusClass(product.stock)}`}
                            onClick={() => setEditStock({ ...editStock, [product._id]: true })}
                            style={{ cursor: 'pointer' }}
                          >
                            {product.stock}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`stock-badge ${getStockStatusClass(product.stock)}`}>
                          {product.stock === 0
                            ? 'Out of Stock'
                            : product.stock < 10
                            ? 'Low Stock'
                            : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="restock-btn"
                          onClick={() => setEditStock({ ...editStock, [product._id]: true })}
                          disabled={updating[product._id] || editStock[product._id]}
                        >
                          {updating[product._id] ? 'Updating...' : 'Restock'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

