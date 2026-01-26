// File: components/UserNavbar.jsx
//
// User Navigation Bar - Simple navigation for user pages with logout

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserNavbar.css';

export default function UserNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="user-navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🛍️</span>
        <span className="brand-text">E-Commerce Store</span>
      </div>

      <div className="navbar-links">
        <NavLink to="/user/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Products
        </NavLink>
        <NavLink to="/user/cart" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Cart
        </NavLink>
        <NavLink to="/user/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          My Orders
        </NavLink>
      </div>

      <div className="navbar-user">
        <span className="user-name">Hi, {user?.name || 'User'}</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

