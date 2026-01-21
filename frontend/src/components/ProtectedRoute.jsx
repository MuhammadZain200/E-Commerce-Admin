import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ fixed path

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Not logged in
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, message: 'You must log in' }}
      />
    );
  }

  if (roles && !roles.includes(user.role)) {
    // Role not allowed
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, message: 'Access denied' }}
      />
    );
  }

  return children;
}
