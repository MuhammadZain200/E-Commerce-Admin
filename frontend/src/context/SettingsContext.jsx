// File: context/SettingsContext.jsx
//
// Settings Context - Global settings state management
// Provides store name and other settings to all components

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, getPublicSettings } from '../api/settings';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    storeName: 'E-COMMERCE', // Default fallback
    currency: 'USD',
    taxRate: 0,
    autoCancelMinutes: 30,
    allowStatusSkipping: false,
    allowEditingPaidOrders: false,
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      let response;
      
      // If user is authenticated and is admin, get full settings
      if (user && user.role === 'admin') {
        response = await getSettings();
        if (response.success && response.data) {
          setSettings({
            storeName: response.data.storeName || 'E-COMMERCE',
            currency: response.data.currency || 'USD',
            taxRate: response.data.taxRate || 0,
            autoCancelMinutes: response.data.autoCancelMinutes || 30,
            allowStatusSkipping: response.data.allowStatusSkipping || false,
            allowEditingPaidOrders: response.data.allowEditingPaidOrders || false,
          });
        }
      } else {
        // For unauthenticated users or non-admin, get public settings (store name only)
        response = await getPublicSettings();
        if (response.success && response.data) {
          setSettings((prev) => ({
            ...prev,
            storeName: response.data.storeName || 'E-COMMERCE',
          }));
        }
      }
    } catch (err) {
      // Silently fail - use default values
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('Failed to load settings:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const refreshSettings = () => {
    loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, refreshSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

