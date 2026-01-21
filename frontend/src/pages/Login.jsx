import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios'; // Optional, if you need extra API calls

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Redirect logged-in users away from login page
  useEffect(() => {
    if (user) {
      // Redirect logged-in users to their role dashboard
      if (user.role === 'admin') navigate('/dashboard/admin');
      else if (user.role === 'staff') navigate('/dashboard/staff');
      else navigate('/dashboard/user');
    }
  }, [user, navigate]);

  // Show success message if redirected from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // login() should return the user object
      const loggedInUser = await login(formData.email, formData.password);

      // Redirect based on role
      if (loggedInUser.role === 'admin') navigate('/dashboard/admin');
      else if (loggedInUser.role === 'staff') navigate('/dashboard/staff');
      else navigate('/dashboard/user');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: '400px', margin: '50px auto' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    button: { padding: '10px 16px', cursor: 'pointer' },
    error: { color: 'red', marginBottom: '10px' },
    success: { color: 'green', marginBottom: '10px' },
    formGroup: { marginBottom: '15px' },
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="register-link">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}
