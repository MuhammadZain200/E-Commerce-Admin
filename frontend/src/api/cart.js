// File: api/cart.js
//
// API functions for shopping cart management (user only)

import api from './axios';

/**
 * Get user's cart
 * GET /api/cart
 */
export const getCart = async () => {
  const response = await api.get('/api/cart');
  return response.data;
};

/**
 * Add item to cart
 * POST /api/cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 */
export const addToCart = async (productId, quantity) => {
  const response = await api.post('/api/cart', { productId, quantity });
  return response.data;
};

/**
 * Update item quantity in cart
 * PUT /api/cart/:productId
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export const updateCartItem = async (productId, quantity) => {
  const response = await api.put(`/api/cart/${productId}`, { quantity });
  return response.data;
};

/**
 * Remove item from cart
 * DELETE /api/cart/:productId
 * @param {string} productId - Product ID
 */
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/api/cart/${productId}`);
  return response.data;
};

/**
 * Clear entire cart
 * DELETE /api/cart
 */
export const clearCart = async () => {
  const response = await api.delete('/api/cart');
  return response.data;
};

