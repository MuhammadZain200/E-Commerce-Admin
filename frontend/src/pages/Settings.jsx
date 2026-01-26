// File: pages/Settings.jsx
//
// Settings Page - Admin-only page for managing store settings and order rules
// Two main sections:
// 1. Store Settings (storeName, currency, taxRate, autoCancelMinutes)
// 2. Order Rules (allowStatusSkipping, allowEditingPaidOrders)

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { getSettings, updateSettings } from '../api/settings';
import './Settings.css';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [settings, setSettings] = useState({
    storeName: '',
    currency: 'USD',
    taxRate: 0,
    autoCancelMinutes: 30,
    allowStatusSkipping: false,
    allowEditingPaidOrders: false,
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSettings();
      if (response.success && response.data) {
        setSettings({
          storeName: response.data.storeName || '',
          currency: response.data.currency || 'USD',
          taxRate: response.data.taxRate || 0,
          autoCancelMinutes: response.data.autoCancelMinutes || 30,
          allowStatusSkipping: response.data.allowStatusSkipping || false,
          allowEditingPaidOrders: response.data.allowEditingPaidOrders || false,
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await updateSettings(settings);
      if (response.success) {
        setSuccess('Settings saved successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading settings...</p>
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
        <div className="settings-page">
          <h1 className="settings-title">⚙️ Settings</h1>
          <p className="settings-subtitle">Manage store configuration and order rules</p>

          {/* Success/Error Messages */}
          {success && (
            <div className="alert alert-success">
              <span>✅</span> {success}
            </div>
          )}
          {error && (
            <div className="alert alert-error">
              <span>❌</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="settings-form">
            {/* ============================================
                STORE SETTINGS SECTION
                ============================================ */}
            <div className="settings-section">
              <h2 className="section-title">🏪 Store Settings</h2>
              <p className="section-description">
                Configure your store's basic information and business rules
              </p>

              <div className="form-group">
                <label htmlFor="storeName">
                  Store Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  placeholder="My E-Commerce Store"
                />
                <small>This name will be displayed throughout the system</small>
              </div>

              <div className="form-group">
                <label htmlFor="currency">
                  Currency <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="currency"
                  name="currency"
                  value={settings.currency}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                  placeholder="USD"
                  style={{ textTransform: 'uppercase' }}
                />
                <small>Currency code (e.g., USD, EUR, GBP)</small>
              </div>

              <div className="form-group">
                <label htmlFor="taxRate">
                  Tax Rate (%) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                />
                <small>
                  Tax percentage applied to all orders (0-100). Current: {settings.taxRate}%
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="autoCancelMinutes">
                  Auto-Cancel Minutes <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="autoCancelMinutes"
                  name="autoCancelMinutes"
                  value={settings.autoCancelMinutes}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="10080"
                  placeholder="30"
                />
                <small>
                  Time in minutes after which unpaid orders are automatically cancelled (0-10080 = 1 week)
                </small>
              </div>
            </div>

            {/* ============================================
                ORDER RULES SECTION
                ============================================ */}
            <div className="settings-section">
              <h2 className="section-title">📋 Order Rules</h2>
              <p className="section-description">
                Configure how orders can be managed and updated
              </p>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowStatusSkipping"
                    checked={settings.allowStatusSkipping}
                    onChange={handleInputChange}
                  />
                  <div className="checkbox-content">
                    <strong>Allow Status Skipping</strong>
                    <small>
                      When enabled, admins can skip order statuses (e.g., created → shipped directly).
                      When disabled, orders must follow the sequence: created → paid → packed → shipped → delivered
                    </small>
                  </div>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowEditingPaidOrders"
                    checked={settings.allowEditingPaidOrders}
                    onChange={handleInputChange}
                  />
                  <div className="checkbox-content">
                    <strong>Allow Editing Paid Orders</strong>
                    <small>
                      When enabled, admins can modify orders after they've been paid.
                      When disabled, paid orders cannot be changed (for data integrity)
                    </small>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Settings'}
              </button>
              <button type="button" className="btn-secondary" onClick={loadSettings} disabled={saving}>
                🔄 Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

