import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './Orders.css';
import './AdminDashboard.css';

// Order status configuration
const ORDER_STATUSES = {
  created: { label: 'Created', next: 'paid', color: '#9e9e9e' },
  paid: { label: 'Paid', next: 'packed', color: '#4caf50' },
  packed: { label: 'Packed', next: 'shipped', color: '#2196f3' },
  shipped: { label: 'Shipped', next: 'delivered', color: '#ff9800' },
  delivered: { label: 'Delivered', next: null, color: '#8bc34a' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Track which order is being updated

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus({ ...updatingStatus, [orderId]: true });
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Reload orders to get updated data
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus({ ...updatingStatus, [orderId]: false });
    }
  };

  const canUpdateStatus = (userRole, orderStatus) => {
    // Only admin and staff can update order status
    if (userRole !== 'admin' && userRole !== 'staff') {
      return false;
    }
    // Can't update if already delivered (final state)
    return orderStatus !== 'delivered';
  };

  const getNextStatus = (currentStatus) => {
    return ORDER_STATUSES[currentStatus]?.next || null;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar />

        <div className="orders-section">
          <div className="orders-header">
            <h2>Order Management</h2>
            <div className="orders-count">Total Orders: {orders.length}</div>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found. Orders will appear here once created.</p>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const nextStatus = getNextStatus(order.status);
                    const isUpdating = updatingStatus[order._id];
                    const canUpdate = canUpdateStatus(user.role, order.status);

                    return (
                      <tr key={order._id}>
                        <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                        <td>
                          <div className="customer-info">
                            <div className="customer-name">{order.createdBy?.name || 'N/A'}</div>
                            <div className="customer-email">{order.createdBy?.email || ''}</div>
                          </div>
                        </td>
                        <td>
                          <div className="order-items">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="order-item">
                                <span className="item-name">{item.productId?.name || 'N/A'}</span>
                                <span className="item-quantity">x{item.quantity}</span>
                                <span className="item-price">${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="total-amount">${order.totalAmount.toFixed(2)}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: ORDER_STATUSES[order.status]?.color || '#9e9e9e',
                              color: 'white',
                            }}
                          >
                            {ORDER_STATUSES[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`payment-badge ${
                              order.paymentStatus === 'paid' ? 'paid' : 'pending'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {canUpdate && nextStatus ? (
                            <button
                              onClick={() => handleStatusUpdate(order._id, nextStatus)}
                              disabled={isUpdating}
                              className="status-update-btn"
                            >
                              {isUpdating ? (
                                <>
                                  <span className="btn-spinner"></span>
                                  Updating...
                                </>
                              ) : (
                                `Mark as ${ORDER_STATUSES[nextStatus]?.label || nextStatus}`
                              )}
                            </button>
                          ) : (
                            <span className="no-action">No action available</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

