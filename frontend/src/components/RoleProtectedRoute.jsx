// File: components/RoleProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleProtectedRoute
 * Protects routes based on authentication and user roles.
 *
 * Props:
 *  - children: JSX elements to render if access is allowed
 *  - allowedRoles: array of roles allowed to access this route
 *
 * Usage:
 * <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
 *    <AdminDashboard />
 * </RoleProtectedRoute>
 */
export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth(); // get current logged-in user from context

  // 1️⃣ Not logged in → redirect to login page
  if (!user) return <Navigate to="/login" />;

  // 2️⃣ User role not allowed → redirect to home or default page
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;

  // 3️⃣ User is logged in and has allowed role → render children
  return children;
}
