// File: components/UserSidebar.jsx
//
// User Sidebar - Orange-themed sidebar for user pages

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './UserSidebar.css';

export default function UserSidebar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🛍️</div>
        <div className="brand-text">
          <div className="brand-name">E-COMMERCE</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/user/products"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🛍️</span>
          <span className="nav-text">Browse Products</span>
        </NavLink>

        <NavLink
          to="/user/cart"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Cart</span>
          {cartCount > 0 && (
            <span className="cart-count-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </NavLink>

        <NavLink
          to="/user/orders"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📦</span>
          <span className="nav-text">My Orders</span>
        </NavLink>

        <div className="nav-separator"></div>

        <div
          className={`nav-item ${activeMenu === 'SETTINGS' ? 'active' : ''}`}
          onClick={() => toggleMenu('SETTINGS')}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
          <span className="dropdown-arrow">▼</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="member-pro">
          <div className="member-pro-title">MEMBER PRO</div>
          <div className="member-pro-text">Upgrade for exclusive deals and faster shipping.</div>
          <button className="upgrade-btn">Upgrade Now</button>
        </div>
      </div>
    </div>
  );
}

