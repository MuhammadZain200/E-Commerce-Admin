// File: components/UserHeader.jsx
//
// User Header - Header bar with search, notifications, cart, and profile

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './UserHeader.css';

export default function UserHeader() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/user/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getRoleDisplay = (role) => {
    if (!role) return 'CUSTOMER';
    if (role === 'user') return 'PREMIUM MEMBER';
    return role.toUpperCase();
  };

  return (
    <div className="user-header">
      <div className="header-left">
        <form className="search-form" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search for luxury items, brands, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="header-right">
        <button className="header-icon-btn notification-btn" title="Notifications">
          <span className="icon">🔔</span>
          <span className="notification-dot"></span>
        </button>
        <button 
          className="header-icon-btn cart-btn" 
          title="Cart"
          onClick={() => navigate('/user/cart')}
        >
          <span className="icon">🛒</span>
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </button>
        <div className="user-profile">
          <div className="profile-info">
            <div className="profile-name">{user?.name || 'User'}</div>
            <div className="profile-role">{getRoleDisplay(user?.role)}</div>
          </div>
          <div className="profile-avatar">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

