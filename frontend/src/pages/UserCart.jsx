// File: pages/UserCart.jsx
//
// User Cart Page - View and manage shopping cart

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../api/cart';
import UserNavbar from '../components/UserNavbar';
import './UserCart.css';

export default function UserCart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating({ ...updating, [productId]: true });
      await updateCartItem(productId, newQuantity);
      await loadCart(); // Reload cart
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdating({ ...updating, [productId]: false });
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return;

    try {
      await removeFromCart(productId);
      await loadCart(); // Reload cart
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear entire cart?')) return;

    try {
      await clearCart();
      await loadCart(); // Reload cart
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="user-cart-page">
        <div className="loading-state">Loading cart...</div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="user-cart-page">
        <UserNavbar />
        <h1>🛒 Shopping Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-cart-page">
      <UserNavbar />
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
        <button className="clear-cart-btn" onClick={handleClearCart}>
          Clear Cart
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.productId} className="cart-item">
              <div className="item-info">
                <h3>{item.product.name}</h3>
                <p className="item-price">${item.product.price.toFixed(2)} each</p>
                <p className="item-stock">Stock: {item.product.stock}</p>
              </div>
              <div className="item-actions">
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={updating[item.productId] || item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={updating[item.productId] || item.quantity >= item.product.stock}
                  >
                    +
                  </button>
                </div>
                <p className="item-total">${item.itemTotal.toFixed(2)}</p>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.productId)}
                  disabled={updating[item.productId]}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items:</span>
            <span>{cart.itemCount}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${cart.totalAmount.toFixed(2)}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

