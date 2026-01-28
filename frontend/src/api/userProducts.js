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

  const url = `/api/products?${params.toString()}`;
  console.log('[API] getProducts() - Network request initiated', {
    url,
    filters,
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n') // Show caller
  });
  const response = await api.get(url);
  console.log('[API] getProducts() - Network request completed', {
    status: response.status,
    success: response.data?.success,
    productsCount: response.data?.data?.length || 0,
    timestamp: new Date().toISOString()
  });
  return response.data;
};

/**
 * Get categories and subcategories for filtering
 * GET /api/products/categories
 */
export const getCategories = async () => {
  console.log('[API] getCategories() - Network request initiated', {
    url: '/api/products/categories',
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n') // Show caller
  });
  const response = await api.get('/api/products/categories');
  console.log('[API] getCategories() - Network request completed', {
    status: response.status,
    success: response.data?.success,
    timestamp: new Date().toISOString()
  });
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

