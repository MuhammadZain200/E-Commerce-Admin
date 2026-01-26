// File: api/staff.js
//
// API functions for staff operations

import api from './axios';

/**
 * Get all products with stock info
 * GET /api/staff/products
 */
export const getProductsWithStock = async () => {
  const response = await api.get('/api/staff/products');
  return response.data;
};

/**
 * Update product stock
 * PUT /api/staff/products/:id/stock
 * @param {string} productId - Product ID
 * @param {number} stock - New stock quantity
 */
export const updateProductStock = async (productId, stock) => {
  const response = await api.put(`/api/staff/products/${productId}/stock`, { stock });
  return response.data;
};

/**
 * Get orders assigned to current staff member
 * GET /api/staff/orders/assigned
 */
export const getAssignedOrders = async () => {
  const response = await api.get('/api/staff/orders/assigned');
  return response.data;
};

/**
 * Get all orders
 * GET /api/staff/orders
 */
export const getAllOrders = async () => {
  const response = await api.get('/api/staff/orders');
  return response.data;
};

/**
 * Update order status
 * PUT /api/staff/orders/:id/status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/api/staff/orders/${orderId}/status`, { status });
  return response.data;
};

