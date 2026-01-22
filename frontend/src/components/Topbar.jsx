import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { logout } = useAuth();
  
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="company-name">E-COMMERCE ADMIN</div>
      </div>
      
      <div className="topbar-right">
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}
