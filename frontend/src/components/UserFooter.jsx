// File: components/UserFooter.jsx
//
// User Footer - Footer for user pages

import React from 'react';
import { useSettings } from '../context/SettingsContext';
import './UserFooter.css';

export default function UserFooter() {
  const { settings } = useSettings();
  
  return (
    <footer className="user-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-icon">🛍️</span>
          <span className="footer-text">{settings.storeName || 'E-COMMERCE'} Admin System</span>
        </div>

        <div className="footer-center">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
          <a href="#" className="footer-link">Help Center</a>
        </div>

        <div className="footer-right">
          <span>© 2024 AdminStore Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

