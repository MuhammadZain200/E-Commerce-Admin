import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StatsCard from '../components/StatsCard';
import ProductOverview from '../components/ProductOverview';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardStats } from '../api/dashboard';
import './AdminDashboard.css';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalInventoryValue: 0,
    recentProducts: [],
    lowStockItems: [],
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar />

        {/* Stats Cards Section */}
        <div className="stats-grid">
          <StatsCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon="📦" 
            color="#FF9800"
          />
          <StatsCard 
            title="Active Products" 
            value={stats.activeProducts} 
            icon="✅" 
            color="#4CAF50"
            subtitle={{ text: `${stats.inactiveProducts} inactive`, icon: "📊" }}
          />
          <StatsCard 
            title="Low Stock" 
            value={stats.lowStockProducts} 
            icon="⚠️" 
            color="#F44336"
            subtitle={{ text: `${stats.outOfStockProducts} out of stock`, icon: "🚨" }}
          />
          <StatsCard 
            title="Inventory Value" 
            value={`$${parseFloat(stats.totalInventoryValue || 0).toLocaleString()}`} 
            icon="💰" 
            color="#2196F3"
            subtitle={{ text: "Total active inventory", icon: "📈" }}
          />
        </div>

        {/* Product Overview Section */}
        <ProductOverview 
          recentProducts={stats.recentProducts || []} 
          lowStockItems={stats.lowStockItems || []} 
        />
      </div>
    </div>
  );
}
