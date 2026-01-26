import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { fetchAnalytics } from '../api/analytics';
import './Analytics.css';
import './AdminDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    pendingOrders: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for top products
  const chartData = {
    labels: analytics.topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: analytics.topProducts.map(product => product.totalQuantity),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 5 Selling Products',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Quantity Sold: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Quantity Sold',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Products',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading analytics...</p>
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
            <button onClick={loadAnalytics} className="retry-btn">
              Retry
            </button>
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

        <div className="analytics-section">
          <div className="analytics-header">
            <h2>Analytics Dashboard</h2>
            <button onClick={loadAnalytics} className="refresh-btn" title="Refresh data">
              🔄 Refresh
            </button>
          </div>

          {/* Key Metrics Cards */}
          <div className="analytics-metrics">
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <h3>Total Sales</h3>
                <p className="metric-value">
                  ${parseFloat(analytics.totalSales || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="metric-description">From completed orders</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">⏳</div>
              <div className="metric-content">
                <h3>Pending Orders</h3>
                <p className="metric-value">{analytics.pendingOrders}</p>
                <p className="metric-description">Awaiting processing</p>
              </div>
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="chart-container">
            <div className="chart-wrapper">
              {analytics.topProducts.length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div className="empty-chart">
                  <p>No sales data available yet.</p>
                  <p className="empty-chart-subtitle">Products will appear here once orders are completed.</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products Table (Alternative View) */}
          {analytics.topProducts.length > 0 && (
            <div className="top-products-table">
              <h3>Top 5 Selling Products</h3>
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product Name</th>
                    <th>Total Quantity Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="rank-cell">
                        <span className={`rank-badge rank-${index + 1}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="product-name-cell">{product.name}</td>
                      <td className="quantity-cell">
                        <strong>{product.totalQuantity}</strong> units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

