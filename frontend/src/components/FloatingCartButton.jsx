// File: components/FloatingCartButton.jsx
//
// Floating Cart Button - Floating action button showing cart item count

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './FloatingCartButton.css';

export default function FloatingCartButton() {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleClick = () => {
    navigate('/user/cart');
  };

  if (cartCount === 0) return null;

  return (
    <button className="floating-cart-btn" onClick={handleClick} title="View Cart">
      <span className="cart-icon">🛒</span>
      {cartCount > 0 && (
        <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
      )}
    </button>
  );
}

