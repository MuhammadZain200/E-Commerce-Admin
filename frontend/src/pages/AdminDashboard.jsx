import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import Products from './Products'; // Products component
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <Navbar />

      <div className="dashboard-content">
        {/* Welcome section */}
        <h1>Welcome, {user.name}</h1>
        <p>This is your admin dashboard. Manage products, orders, and more.</p>

        {/* Quick stats section */}
        <div className="stats-grid">
          <div className="stats-card">
            <h2>Total Products</h2>
            <p>—</p> {/* Replace with backend data later */}
          </div>
          <div className="stats-card">
            <h2>Active Products</h2>
            <p>—</p>
          </div>
          <div className="stats-card">
            <h2>Inactive Products</h2>
            <p>—</p>
          </div>
        </div>

        {/* Products management section */}
        {user.role === 'admin' && (
          <div className="products-section">
            <h2>Product Management</h2>
            <Products />
          </div>
        )}
      </div>
    </div>
  );
}
