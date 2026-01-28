// File: api/settings.js
//
// API functions for Settings and User Management
// All endpoints require admin role

import api from './axios';

// ============================================
// SETTINGS API
// ============================================

/**
 * Get public settings (store name) - no auth required
 * GET /api/settings/public
 */
export const getPublicSettings = async () => {
  const response = await api.get('/api/settings/public');
  return response.data;
};

/**
 * Get current settings (admin only)
 * GET /api/admin/settings
 */
export const getSettings = async () => {
  const response = await api.get('/api/admin/settings');
  return response.data;
};

/**
 * Update settings
 * PUT /api/admin/settings
 * @param {Object} settingsData - Settings object with fields to update
 */
export const updateSettings = async (settingsData) => {
  const response = await api.put('/api/admin/settings', settingsData);
  return response.data;
};

// ============================================
// USER MANAGEMENT API
// ============================================

/**
 * Get all users
 * GET /api/admin/users
 */
export const getUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

/**
 * Activate a user
 * PATCH /api/admin/users/:id/activate
 * @param {string} userId - User ID
 */
export const activateUser = async (userId) => {
  const response = await api.patch(`/api/admin/users/${userId}/activate`);
  return response.data;
};

/**
 * Deactivate a user
 * PATCH /api/admin/users/:id/deactivate
 * @param {string} userId - User ID
 */
export const deactivateUser = async (userId) => {
  const response = await api.patch(`/api/admin/users/${userId}/deactivate`);
  return response.data;
};

/**
 * Change user role
 * PATCH /api/admin/users/:id/role
 * @param {string} userId - User ID
 * @param {string} role - New role (admin | user)
 */
export const changeUserRole = async (userId, role) => {
  const response = await api.patch(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Delete a user account
 * DELETE /api/admin/users/:id
 * @param {string} userId - User ID
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};

