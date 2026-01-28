import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '10px', borderBottom: '1px solid #ccc' }}>
      <span>Welcome, {user?.name || 'Guest'}</span>

      {/* Admin button - only visible to admins */}
      {user?.role === 'admin' && (
        <button onClick={() => navigate('/admin')}>Admin Panel</button>
      )}

      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
}
