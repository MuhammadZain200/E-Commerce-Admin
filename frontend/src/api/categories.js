// File: api/categories.js
//
// Category API - Frontend API functions for managing categories and subcategories
// All endpoints require admin authentication

import axios from './axios';

const API_BASE = '/api/admin/categories';

// ============================================
// CATEGORY API FUNCTIONS
// ============================================

/**
 * Get all categories
 * @param {boolean} activeOnly - If true, only return active categories (for product forms)
 * @returns {Promise} Axios response with categories array
 */
export const getCategories = (activeOnly = false) => {
  const params = activeOnly ? { params: { activeOnly: 'true' } } : {};
  return axios.get(API_BASE, params);
};

/**
 * Create a new category
 * @param {Object} data - { name: string }
 * @returns {Promise} Axios response with created category
 */
export const createCategory = (data) => {
  return axios.post(API_BASE, data);
};

/**
 * Update an existing category
 * @param {string} id - Category ID
 * @param {Object} data - { name: string, isActive?: boolean }
 * @returns {Promise} Axios response with updated category
 */
export const updateCategory = (id, data) => {
  return axios.put(`${API_BASE}/${id}`, data);
};

/**
 * Soft-delete a category (set isActive to false)
 * Also soft-deletes all subcategories under this category
 * @param {string} id - Category ID
 * @returns {Promise} Axios response
 */
export const deleteCategory = (id) => {
  return axios.delete(`${API_BASE}/${id}`);
};

// ============================================
// SUBCATEGORY API FUNCTIONS
// ============================================

/**
 * Get all subcategories
 * @param {Object} filters - { categoryId?: string, activeOnly?: boolean }
 * @returns {Promise} Axios response with subcategories array
 */
export const getSubCategories = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.activeOnly) params.append('activeOnly', 'true');
  
  const queryString = params.toString();
  const url = queryString 
    ? `${API_BASE}/subcategories?${queryString}`
    : `${API_BASE}/subcategories`;
  
  return axios.get(url);
};

/**
 * Create a new subcategory
 * @param {Object} data - { name: string, categoryId: string }
 * @returns {Promise} Axios response with created subcategory
 */
export const createSubCategory = (data) => {
  return axios.post(`${API_BASE}/subcategories`, data);
};

/**
 * Update an existing subcategory
 * @param {string} id - Subcategory ID
 * @param {Object} data - { name: string, categoryId?: string, isActive?: boolean }
 * @returns {Promise} Axios response with updated subcategory
 */
export const updateSubCategory = (id, data) => {
  return axios.put(`${API_BASE}/subcategories/${id}`, data);
};

/**
 * Soft-delete a subcategory (set isActive to false)
 * @param {string} id - Subcategory ID
 * @returns {Promise} Axios response
 */
export const deleteSubCategory = (id) => {
  return axios.delete(`${API_BASE}/subcategories/${id}`);
};

