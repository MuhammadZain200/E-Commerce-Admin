import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { logout, user } = useAuth();
  
  const getRoleDisplay = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="welcome-text">
          Welcome, <span className="user-name">{user?.name || 'User'}</span>
        </div>
      </div>
      
      <div className="topbar-center">
        <div className="role-badge">
          {getRoleDisplay(user?.role)}
        </div>
      </div>
      
      <div className="topbar-right">
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}
