import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StatsCard from '../components/StatsCard';
import ProductOverview from '../components/ProductOverview';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardStats } from '../api/dashboard';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
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
            title="Total Orders" 
            value={stats.totalOrders} 
            icon="📋" 
            color="#9C27B0"
          />
          <StatsCard 
            title="Pending Orders" 
            value={stats.pendingOrders} 
            icon="⏳" 
            color="#FF9800"
            subtitle={{ text: `${stats.totalOrders - stats.pendingOrders} completed`, icon: "✅" }}
          />
          <StatsCard 
            title="Low Stock Products" 
            value={stats.lowStockProducts} 
            icon="⚠️" 
            color="#F44336"
            subtitle={{ text: `${stats.outOfStockProducts} out of stock`, icon: "🚨" }}
          />
          <StatsCard 
            title="Total Revenue" 
            value={`$${parseFloat(stats.totalRevenue || 0).toLocaleString()}`} 
            icon="💰" 
            color="#4CAF50"
            subtitle={{ text: "From delivered orders", icon: "📈" }}
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
