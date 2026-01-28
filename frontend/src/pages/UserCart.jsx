// File: pages/UserCart.jsx
//
// User Cart Page - Redesigned to match UI design

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
// Removed getCart import - using cart from CartContext instead
import { updateCartItem, removeFromCart, clearCart } from '../api/cart';
import UserLayout from '../components/UserLayout';
import './UserCart.css';

export default function UserCart() {
  const { user } = useAuth();
  // Use cart from context instead of making duplicate API call
  // CartContext already fetches cart on mount and when user changes
  const { cart: cartFromContext, refreshCart } = useCart();
  const { success, error: showError, info } = useNotification();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [promoCode, setPromoCode] = useState('');

  // Use cart from context - no need for separate API call
  // CartContext already fetches cart on mount and when user changes
  const cart = cartFromContext;
  const loading = cart === null && !error; // Loading if cart is null and no error yet

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating({ ...updating, [productId]: true });
      await updateCartItem(productId, newQuantity);
      refreshCart(); // Update global cart - no need for separate loadCart call
      success('Quantity updated successfully');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdating({ ...updating, [productId]: false });
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      refreshCart(); // Update global cart - no need for separate loadCart call
      success('Item removed from cart');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      refreshCart(); // Update global cart - no need for separate loadCart call
      success('Cart cleared successfully');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      showError('Cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const handleApplyPromo = () => {
    // Placeholder for promo code functionality
    info('Promo code functionality coming soon!');
  };

  const calculateTax = () => {
    if (!cart || cart.taxAmount === undefined) return 0;
    return cart.taxAmount || 0;
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.totalWithTax || cart.totalAmount || 0;
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="loading-state">Loading cart...</div>
      </UserLayout>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <UserLayout>
        <div className="user-cart-page">
          <div className="breadcrumbs">
            <span>Home</span> / <span>Shopping Cart</span>
          </div>
          <h1>Your Shopping Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/user/products')}>
              ← Continue Shopping
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="user-cart-page">
        <div className="breadcrumbs">
          <span>Home</span> / <span>Shopping Cart</span>
        </div>

        <div className="cart-header-section">
          <h1>Your Shopping Cart</h1>
          <p className="cart-subtitle">
            You have <strong>{cart.itemCount} items</strong> ready for checkout
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="cart-main-content">
          <div className="cart-items-section">
            {cart.items.map((item) => (
              <div key={item.productId} className="cart-item-card">
                <div className="item-image">
                  <div className="item-image-placeholder">
                    {item.product.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-specs">
                    {item.product.stock === 0 ? (
                      <span className="stock-warning-out">⚠️ OUT OF STOCK</span>
                    ) : item.product.stock <= 10 ? (
                      <span className="stock-warning-low">⚠️ Low Stock: {item.product.stock} available</span>
                    ) : (
                      <span>Stock: {item.product.stock} | SKU: {item.productId.slice(-8)}</span>
                    )}
                  </p>
                  <div className="item-price">${item.product.price.toFixed(2)}</div>
                </div>
                <div className="item-quantity">
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={updating[item.productId] || item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      disabled={updating[item.productId] || item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="item-actions">
                  <button
                    className="delete-btn"
                    onClick={() => handleRemoveItem(item.productId)}
                    disabled={updating[item.productId]}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-actions">
              <button className="continue-shopping-btn" onClick={() => navigate('/user/products')}>
                ← Continue Shopping
              </button>
              <button className="clear-cart-btn" onClick={handleClearCart}>
                Clear Shopping Cart
              </button>
            </div>
          </div>

          <div className="order-summary-sidebar">
            <h2>Order Summary</h2>

            <div className="promo-section">
              <p className="promo-label">Have a promo code?</p>
              <div className="promo-input-group">
                <input
                  type="text"
                  placeholder="CODE2024"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-input"
                />
                <button className="apply-btn" onClick={handleApplyPromo}>
                  Apply
                </button>
              </div>
            </div>

            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping Estimates:</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax:</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-total">
              <div className="total-label">Total</div>
              <div className="total-amount">${calculateTotal().toFixed(2)}</div>
              <div className="total-note">INCLUDING VAT</div>
            </div>

            <button className="checkout-btn-large" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>

            <div className="trust-badges">
              <div className="trust-badge">
                <span className="badge-icon">🛡️</span>
                <span>SECURE</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">🚚</span>
                <span>FAST</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">↩️</span>
                <span>RETURNS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
