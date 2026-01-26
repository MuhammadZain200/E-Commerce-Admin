// File: components/OrderDetailsModal.jsx
//
// Order Details Modal - Shows complete order information

import React from 'react';
import './OrderDetailsModal.css';

export default function OrderDetailsModal({ isOpen, onClose, order, loading }) {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      created: { label: 'PROCESSING', class: 'status-processing' },
      paid: { label: 'PROCESSING', class: 'status-processing' },
      packed: { label: 'PROCESSING', class: 'status-processing' },
      shipped: { label: 'SHIPPED', class: 'status-shipped' },
      delivered: { label: 'DELIVERED', class: 'status-delivered' },
    };
    return statusMap[status] || { label: status.toUpperCase(), class: 'status-processing' };
  };

  const getPaymentStatusDisplay = (paymentStatus) => {
    return paymentStatus === 'paid' ? 'Paid' : 'Pending';
  };

  if (loading) {
    return (
      <div className="order-details-modal-overlay" onClick={onClose}>
        <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="order-details-loading">
            <div className="loader"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusInfo = getStatusDisplay(order.status);
  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const taxAmount = order.totalAmount - subtotal;

  return (
    <div className="order-details-modal-overlay" onClick={onClose}>
      <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-details-header">
          <h2>Order Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="order-details-body">
          {/* Order Info Section */}
          <div className="order-info-section">
            <div className="info-row">
              <span className="info-label">Order ID:</span>
              <span className="info-value">#{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Status:</span>
              <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Status:</span>
              <span className={`payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                {getPaymentStatusDisplay(order.paymentStatus)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Date:</span>
              <span className="info-value">{formatDate(order.createdAt)}</span>
            </div>
            {order.assignedStaffId && (
              <div className="info-row">
                <span className="info-label">Assigned Staff:</span>
                <span className="info-value">{order.assignedStaffId.name || 'N/A'}</span>
              </div>
            )}
          </div>

          {/* Order Items Section */}
          <div className="order-items-section">
            <h3>Order Items</h3>
            <div className="items-list">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <div className="item-info">
                      <div className="item-name">
                        {item.productId?.name || 'Product Name'}
                      </div>
                      <div className="item-details">
                        Quantity: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="item-total">
                      ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-items">No items found</p>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="order-summary-section">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span className="summary-label">Subtotal:</span>
              <span className="summary-value">${subtotal.toFixed(2)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="summary-row">
                <span className="summary-label">Tax:</span>
                <span className="summary-value">${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total-row">
              <span className="summary-label">Total:</span>
              <span className="summary-value">${order.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="order-details-footer">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

