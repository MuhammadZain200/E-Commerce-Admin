// File: pages/Checkout.jsx
//
// Checkout Page - Place order from cart

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
// Removed getCart import - using cart from CartContext instead
import { checkoutFromCart } from '../api/orders';
import UserLayout from '../components/UserLayout';
import ConfirmationModal from '../components/ConfirmationModal';
import './Checkout.css';

export default function Checkout() {
  const { user } = useAuth();
  // Use cart from context instead of making duplicate API call
  // CartContext already fetches cart on mount and when user changes
  const { cart: cartFromContext, refreshCart } = useCart();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Use cart from context - no need for separate API call
  const cart = cartFromContext;
  const loading = cart === null && !error; // Loading if cart is null and no error yet

  // Redirect to cart if empty (using effect to handle context updates)
  // But don't redirect if we're processing an order or have just placed one
  useEffect(() => {
    if (cart !== null && (!cart.items || cart.items.length === 0) && !processing && !orderPlaced) {
      navigate('/user/cart');
    }
  }, [cart, navigate, processing, orderPlaced]);

  const handlePlaceOrderClick = () => {
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    // Close modal and proceed with order
    setShowConfirmModal(false);
    
    try {
      setProcessing(true);
      setError(null);
      const response = await checkoutFromCart();
      // Check response.data.success since axios wraps the response
      if (response.data?.success || response.status === 201) {
        // Mark order as placed to prevent redirect to cart
        setOrderPlaced(true);
        // Reset processing state immediately
        setProcessing(false);
        // Refresh cart to clear it (cart will be empty after checkout)
        refreshCart();
        success('Order placed successfully! Redirecting to your orders...');
        // Navigate to orders page (clears order summary, updates button)
        setTimeout(() => {
          navigate('/user/orders');
        }, 500);
      } else {
        throw new Error('Order placement failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to place order';
      setError(errorMsg);
      showError(errorMsg);
      setProcessing(false);
    }
  };

  const handleCancelOrder = () => {
    // Close modal and stay on checkout page
    setShowConfirmModal(false);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="loading-state">Loading...</div>
      </UserLayout>
    );
  }

  // Show success state if order was placed
  if (orderPlaced) {
    return (
      <UserLayout>
        <div className="checkout-page">
          <div className="order-success-state">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order has been confirmed and is being processed.</p>
            <p className="redirect-message">Redirecting to your orders...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Redirect to cart if no items (but not if order was just placed)
  if ((!cart || !cart.items || cart.items.length === 0) && !orderPlaced && !processing) {
    return null; // Will redirect via useEffect
  }

  return (
    <UserLayout>
      <div className="checkout-page">
        <h1>✅ Checkout</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.items.map((item) => (
              <div key={item.productId} className="order-item">
                <div>
                  <strong>{item.product.name}</strong>
                  <p>Quantity: {item.quantity} × ${item.product.price.toFixed(2)}</p>
                </div>
                <div className="item-total">${item.itemTotal.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Total: ${cart.totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div className="checkout-actions">
          <button
            className="place-order-btn"
            onClick={handlePlaceOrderClick}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Place Order'}
          </button>
          <button
            className="cancel-btn"
            onClick={() => navigate('/user/cart')}
            disabled={processing}
          >
            Back to Cart
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelOrder}
        onConfirm={handleConfirmOrder}
        title="Confirm Order"
        message="Are you sure you want to place this order? This action cannot be undone."
        confirmText="Yes, Place Order"
        cancelText="No, Cancel"
      />
      </div>
    </UserLayout>
  );
}

