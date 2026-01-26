// File: pages/Checkout.jsx
//
// Checkout Page - Place order from cart

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../api/cart';
import { checkoutFromCart } from '../api/orders';
import UserNavbar from '../components/UserNavbar';
import './Checkout.css';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      if (response.success) {
        setCart(response.data);
        if (!response.data.items || response.data.items.length === 0) {
          navigate('/cart');
        }
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!window.confirm('Place this order?')) return;

    try {
      setProcessing(true);
      setError(null);
      const response = await checkoutFromCart();
      if (response.success) {
        alert('Order placed successfully!');
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <UserNavbar />
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="checkout-page">
      <UserNavbar />
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
            onClick={handlePlaceOrder}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Place Order'}
          </button>
          <button
            className="cancel-btn"
            onClick={() => navigate('/cart')}
            disabled={processing}
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

