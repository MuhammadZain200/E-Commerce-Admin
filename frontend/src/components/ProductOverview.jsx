import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductOverview({ recentProducts, lowStockItems }) {
  return (
    <div className="product-overview-section">
      <div className="overview-grid">
        {/* Recent Products */}
        <div className="overview-card">
          <div className="overview-header">
            <h3>Recent Products</h3>
            <Link to="/products" className="view-all-link">View All →</Link>
          </div>
          <div className="overview-content">
            {recentProducts && recentProducts.length > 0 ? (
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="product-name">{product.name}</td>
                      <td>${product.price?.toFixed(2) || '0.00'}</td>
                      <td>
                        <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No products yet. Create your first product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="overview-card">
          <div className="overview-header">
            <h3>Low Stock Alerts</h3>
            <span className="alert-count">{lowStockItems?.length || 0}</span>
          </div>
          <div className="overview-content">
            {lowStockItems && lowStockItems.length > 0 ? (
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((product) => (
                    <tr key={product._id}>
                      <td className="product-name">{product.name}</td>
                      <td>
                        <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>${product.price?.toFixed(2) || '0.00'}</td>
                      <td>
                        <Link to="/products" className="action-link">Restock →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>All products are well stocked! ✅</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

