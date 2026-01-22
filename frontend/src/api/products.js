import axios from './axios';

const API_BASE = '/api/admin';

export const fetchProducts = () => axios.get(`${API_BASE}`);
export const createProduct = (data) => axios.post(`${API_BASE}`, data);
export const updateProduct = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const toggleProductStatus = (id) => axios.patch(`${API_BASE}/${id}/toggle`);
