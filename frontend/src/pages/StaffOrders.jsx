// File: pages/StaffOrders.jsx
//
// Staff Orders Page - View and manage assigned orders

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getAssignedOrders, getAllOrders, updateOrderStatus } from '../api/staff';
import './StaffOrders.css';

export default function StaffOrders() {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('assigned'); // 'assigned' or 'all'
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    loadOrders();
    // Refresh orders every 5 seconds for real-time updates
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [viewMode]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response =
        viewMode === 'assigned'
          ? await getAssignedOrders()
          : await getAllOrders();
      // Handle different response formats
      const ordersData = response.success
        ? (response.data || [])
        : (Array.isArray(response.data) ? response.data : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating({ ...updating, [orderId]: true });
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Reload orders
      success('Order status updated successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating({ ...updating, [orderId]: false });
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      created: 'paid',
      paid: 'packed',
      packed: 'shipped',
      shipped: 'delivered',
    };
    return statusFlow[currentStatus];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="loading-state">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar />
        <div className="staff-orders-page">
          <div className="page-header">
            <h1>📋 Order Management</h1>
            <div className="view-toggle">
              <button
                className={viewMode === 'assigned' ? 'active' : ''}
                onClick={() => setViewMode('assigned')}
              >
                My Assigned Orders
              </button>
              <button
                className={viewMode === 'all' ? 'active' : ''}
                onClick={() => setViewMode('all')}
              >
                All Orders
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                return (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div>
                        <strong>Order #{order._id.slice(-8)}</strong>
                        <p className="order-date">{formatDate(order.createdAt)}</p>
                        <p className="order-customer">
                          Customer: {order.createdBy?.name || 'Unknown'} ({order.createdBy?.email || 'N/A'})
                        </p>
                        {order.assignedStaffId && (
                          <p className="order-assigned">
                            Assigned to: {order.assignedStaffId.name}
                          </p>
                        )}
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
                      {nextStatus && (
                        <button
                          className="update-status-btn"
                          onClick={() => handleStatusUpdate(order._id, nextStatus)}
                          disabled={updating[order._id]}
                        >
                          {updating[order._id]
                            ? 'Updating...'
                            : `Mark as ${nextStatus.toUpperCase()}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

