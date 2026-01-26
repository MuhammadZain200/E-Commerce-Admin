// File: components/Notification.jsx
//
// Notification Component - Themed toast notifications

import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { setNotificationCallback } from '../api/axios';
import './Notification.css';

export default function NotificationContainer() {
  const { notifications, removeNotification, showNotification } = useNotification();

  // Set up global notification callback for axios interceptor
  useEffect(() => {
    setNotificationCallback((message, type) => {
      showNotification(message, type);
    });

    // Listen for custom events (fallback)
    const handleCustomNotification = (event) => {
      const { message, type } = event.detail;
      showNotification(message, type);
    };

    window.addEventListener('showNotification', handleCustomNotification);
    return () => {
      window.removeEventListener('showNotification', handleCustomNotification);
      setNotificationCallback(null);
    };
  }, [showNotification]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-content">
            <span className="notification-icon">{getIcon(notification.type)}</span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

