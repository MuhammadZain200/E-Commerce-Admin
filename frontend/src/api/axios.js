import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000', // your backend
});

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
      alert('Session expired or unauthorized. Please log in again.');
      window.location.href = '/login'; // redirect to login page
    } else if (status === 403) {
      // Role-based forbidden
      alert('Forbidden: You do not have access to this resource.');
    } else if (status === 400) {
      // Bad request
      alert(error.response?.data?.message || 'Bad request.');
    }

    return Promise.reject(error); // allow component to catch if needed
  }
);

export default api;
