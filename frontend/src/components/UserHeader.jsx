// File: components/UserHeader.jsx
//
// User Header - Header bar with welcome message and logout

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserHeader.css';

export default function UserHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplay = (role) => {
    if (!role) return 'CUSTOMER';
    return role.toUpperCase();
  };

  return (
    <div className="user-header">
      <div className="header-left">
        <div className="welcome-text">
          Welcome, <span className="user-name">{user?.name || 'User'}</span>
        </div>
        <div className="role-badge">{getRoleDisplay(user?.role)}</div>
      </div>

      <div className="header-right">
        <button className="notification-btn" title="Notifications">
          🔔
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

