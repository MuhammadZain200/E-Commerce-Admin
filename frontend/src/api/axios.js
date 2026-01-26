import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000', // your backend
});

// Global notification event emitter (for use in interceptors)
let notificationCallback = null;

export const setNotificationCallback = (callback) => {
  notificationCallback = callback;
};

// Helper to show notification from interceptor
const showNotification = (message, type = 'error') => {
  if (notificationCallback) {
    notificationCallback(message, type);
  } else {
    // Fallback to custom event if callback not set
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message, type } }));
  }
};

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // get from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor to handle errors
api.interceptors.response.use(
  (response) => response, // just return response if successful
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token missing or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showNotification('Session expired or unauthorized. Please log in again.', 'error');
      setTimeout(() => {
        window.location.href = '/login'; // redirect to login page
      }, 2000);
    } else if (status === 403) {
      // Role-based forbidden
      showNotification('Forbidden: You do not have access to this resource.', 'error');
    } else if (status === 400) {
      // Bad request - let components handle this, don't show global notification
      // Components will show appropriate notifications
    }

    return Promise.reject(error); // allow component to catch if needed
  }
);

export default api;
