// File: api/userProducts.js
//
// API functions for user product browsing

import api from './axios';

/**
 * Get products with filters
 * GET /api/products
 * @param {Object} filters - { categoryId, subCategoryId, inStock }
 */
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.subCategoryId) params.append('subCategoryId', filters.subCategoryId);
  if (filters.inStock) params.append('inStock', filters.inStock);

  const response = await api.get(`/api/products?${params.toString()}`);
  return response.data;
};

/**
 * Get categories and subcategories for filtering
 * GET /api/products/categories
 */
export const getCategories = async () => {
  const response = await api.get('/api/products/categories');
  return response.data;
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
export const getProductById = async (productId) => {
  const response = await api.get(`/api/products/${productId}`);
  return response.data;
};

