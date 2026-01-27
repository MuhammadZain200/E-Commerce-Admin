// File: api/userProfile.js
//
// API functions for user profile management

import api from './axios';

/**
 * Update user profile (name, email, phone)
 * PUT /api/auth/profile
 * @param {Object} profileData - { name, email, phone }
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/api/auth/profile', profileData);
  return response.data;
};

/**
 * Change user password
 * PUT /api/auth/password
 * @param {Object} passwordData - { currentPassword, newPassword }
 */
export const changePassword = async (passwordData) => {
  const response = await api.put('/api/auth/password', passwordData);
  return response.data;
};

