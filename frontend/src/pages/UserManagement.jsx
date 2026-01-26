// File: pages/UserManagement.jsx
//
// User Management Page - Admin-only page for managing users
// Features:
// - List all users
// - Activate/Deactivate users
// - Change user roles (admin | staff | user)

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import {
  getUsers,
  activateUser,
  deactivateUser,
  changeUserRole,
  deleteUser,
} from '../api/settings';
import './UserManagement.css';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // Track which action is loading

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    try {
      setActionLoading({ ...actionLoading, [userId]: 'activate' });
      setError(null);
      setSuccess(null);

      const response = await activateUser(userId);
      if (response.success) {
        setSuccess(`User activated successfully!`);
        setTimeout(() => setSuccess(null), 3000);
        loadUsers(); // Refresh list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate user.');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: null });
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      setActionLoading({ ...actionLoading, [userId]: 'deactivate' });
      setError(null);
      setSuccess(null);

      const response = await deactivateUser(userId);
      if (response.success) {
        setSuccess(`User deactivated successfully!`);
        setTimeout(() => setSuccess(null), 3000);
        loadUsers(); // Refresh list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: null });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading({ ...actionLoading, [userId]: 'role' });
      setError(null);
      setSuccess(null);

      const response = await changeUserRole(userId, newRole);
      if (response.success) {
        setSuccess(`User role changed to ${newRole} successfully!`);
        setTimeout(() => setSuccess(null), 3000);
        loadUsers(); // Refresh list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change user role.');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: null });
    }
  };

  const handleDelete = async (userId) => {
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [userId]: 'delete' });
      setError(null);
      setSuccess(null);

      const response = await deleteUser(userId);
      if (response.success) {
        setSuccess('User deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
        loadUsers(); // Refresh list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: null });
    }
  };

  // Check if current user can modify/delete a specific admin user
  const canModifyAdmin = (user) => {
    // If not an admin, can always modify
    if (user.role !== 'admin') {
      return true;
    }

    // If admin but no assignedByAdmin (legacy admin or self-assigned), anyone can modify
    if (!user.assignedByAdmin) {
      return true;
    }

    // Only the admin who assigned the role can modify
    // Handle both populated object and ID string
    const assignedById = typeof user.assignedByAdmin === 'object' 
      ? user.assignedByAdmin._id 
      : user.assignedByAdmin;
    
    return assignedById === currentUser.id || assignedById.toString() === currentUser.id;
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'staff':
        return 'badge-staff';
      case 'user':
        return 'badge-user';
      default:
        return 'badge-user';
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'badge-active' : 'badge-inactive';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar user={currentUser} />
        <div className="main-content">
          <Topbar />
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={currentUser} />
      <div className="main-content">
        <Topbar />
        <div className="user-management-page">
          <div className="page-header">
            <h1 className="page-title">👥 User Management</h1>
            <button className="btn-refresh" onClick={loadUsers}>
              🔄 Refresh
            </button>
          </div>

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

          {/* Users Table */}
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isCurrentUser = user._id === currentUser.id;
                    const isLoading = actionLoading[user._id];
                    const canModify = canModifyAdmin(user);
                    const assignedByInfo = user.assignedByAdmin 
                      ? (typeof user.assignedByAdmin === 'object' 
                          ? user.assignedByAdmin.name 
                          : 'Unknown')
                      : null;

                    return (
                      <tr key={user._id} className={!user.isActive ? 'row-inactive' : ''}>
                        <td>
                          <strong>{user.name}</strong>
                          {isCurrentUser && <span className="current-user-badge">(You)</span>}
                          {user.role === 'admin' && assignedByInfo && (
                            <div className="assigned-by-info">
                              <small>Assigned by: {assignedByInfo}</small>
                            </div>
                          )}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(user.isActive)}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {/* Role Change Dropdown */}
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              disabled={isCurrentUser || isLoading || !canModify}
                              className="role-select"
                              title={!canModify && user.role === 'admin' 
                                ? 'Only the admin who assigned this role can modify it' 
                                : ''}
                            >
                              <option value="admin">Admin</option>
                              <option value="staff">Staff</option>
                              <option value="user">User</option>
                            </select>

                            {/* Activate/Deactivate Button */}
                            {user.isActive ? (
                              <button
                                className="btn-action btn-deactivate"
                                onClick={() => handleDeactivate(user._id)}
                                disabled={isCurrentUser || isLoading || !canModify}
                                title={!canModify && user.role === 'admin' 
                                  ? 'Only the admin who assigned this role can deactivate it' 
                                  : ''}
                              >
                                {isLoading === 'deactivate' ? '...' : 'Deactivate'}
                              </button>
                            ) : (
                              <button
                                className="btn-action btn-activate"
                                onClick={() => handleActivate(user._id)}
                                disabled={isCurrentUser || isLoading || !canModify}
                              >
                                {isLoading === 'activate' ? '...' : 'Activate'}
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(user._id)}
                              disabled={isCurrentUser || isLoading || !canModify}
                              title={!canModify && user.role === 'admin' 
                                ? 'Only the admin who assigned this role can delete this account' 
                                : isCurrentUser 
                                ? 'You cannot delete your own account' 
                                : 'Delete user account'}
                            >
                              {isLoading === 'delete' ? '...' : '🗑️ Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

