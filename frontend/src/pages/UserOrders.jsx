// File: pages/UserOrders.jsx
//
// User Orders Page - Redesigned to match UI design

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchOrders } from '../api/orders';
import UserLayout from '../components/UserLayout';
import './UserOrders.css';

export default function UserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    loadOrders();
    // Refresh orders every 5 seconds for real-time updates
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrders();
      // Handle response format: { success: true, data: [...] } or direct array
      let ordersData = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      }
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setFilteredOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
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

  const getStatusDisplay = (status) => {
    const statusMap = {
      created: 'PROCESSING',
      paid: 'PROCESSING',
      packed: 'PROCESSING',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
    };
    return statusMap[status] || status.toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getOrderStats = () => {
    const total = orders.length;
    const ongoing = orders.filter(
      (o) => ['created', 'paid', 'packed', 'shipped'].includes(o.status)
    ).length;
    const completed = orders.filter((o) => o.status === 'delivered').length;
    return { total, ongoing, completed };
  };

  const stats = getOrderStats();

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (orderId) => {
    // Navigate to order details page or show modal
    alert(`View details for order ${orderId}`);
  };

  const handleTrackOrder = (orderId) => {
    // Navigate to tracking page
    alert(`Track order ${orderId}`);
  };

  const handleReorder = (order) => {
    // Add all items from order to cart
    alert('Reorder functionality coming soon!');
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="loading-state">Loading orders...</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="user-orders-page">
        <div className="page-header-section">
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Check status, track shipments, and manage past orders.</p>
          </div>
          <div className="search-filter-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="filter-btn">
              <span className="filter-icon">🔽</span>
              Filter
            </button>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="order-summary-cards">
          <div className="summary-card">
            <div className="summary-icon">📋</div>
            <div className="summary-content">
              <div className="summary-label">TOTAL ORDERS</div>
              <div className="summary-value">{stats.total}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🚚</div>
            <div className="summary-content">
              <div className="summary-label">ONGOING SHIPMENTS</div>
              <div className="summary-value">{stats.ongoing}</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-label">COMPLETED</div>
              <div className="summary-value">{stats.completed}</div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {paginatedOrders.map((order) => {
                const statusClass = getStatusBadgeClass(order.status);
                const statusDisplay = getStatusDisplay(order.status);
                const isDelivered = order.status === 'delivered';
                const isShipped = order.status === 'shipped';
                const isProcessing = ['created', 'paid', 'packed'].includes(order.status);

                return (
                  <div key={order._id} className="order-card">
                    <div className="order-product-images">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="product-image-circle">
                          <div className="product-image-placeholder">
                            {item.productId?.name?.charAt(0).toUpperCase() || 'P'}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="product-image-circle more-items">
                          +{order.items.length - 2}
                        </div>
                      )}
                    </div>

                    <div className="order-details">
                      <div className="order-id">#{order._id.slice(-8)}</div>
                      <div className={`status-badge ${statusClass}`}>{statusDisplay}</div>
                      <div className="order-info">
                        Placed on {formatDate(order.createdAt)} • {order.items.length} Item
                        {order.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="order-total">TOTAL PRICE ${order.totalAmount.toFixed(2)}</div>
                    </div>

                    <div className="order-actions">
                      <button
                        className="action-btn view-details"
                        onClick={() => handleViewDetails(order._id)}
                      >
                        View Details
                      </button>
                      {isShipped && (
                        <button
                          className="action-btn primary track-order"
                          onClick={() => handleTrackOrder(order._id)}
                        >
                          🚚 Track Order
                        </button>
                      )}
                      {isProcessing && (
                        <button
                          className="action-btn primary modify-order"
                          onClick={() => handleViewDetails(order._id)}
                        >
                          ✏️ Modify
                        </button>
                      )}
                      {isDelivered && (
                        <button
                          className="action-btn primary reorder"
                          onClick={() => handleReorder(order)}
                        >
                          🔄 Reorder
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-section">
                <div className="pagination-info">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} of{' '}
                  {filteredOrders.length} orders
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}
