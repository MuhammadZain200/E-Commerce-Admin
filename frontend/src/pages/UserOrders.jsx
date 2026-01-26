// File: pages/UserOrders.jsx
//
// User Orders Page - View order history and track order status

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchOrders } from '../api/orders';
import UserNavbar from '../components/UserNavbar';
import './UserOrders.css';

export default function UserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrders();
      if (response.data && response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setOrders(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      created: 'status-created',
      paid: 'status-paid',
      packed: 'status-packed',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
    };
    return statusClasses[status] || 'status-created';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="user-orders-page">
        <UserNavbar />
        <div className="loading-state">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="user-orders-page">
      <UserNavbar />
      <h1>📦 My Orders</h1>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>You have no orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <strong>Order #{order._id.slice(-8)}</strong>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>
                      {item.productId?.name || 'Product'} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
                <span className="payment-status">
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

