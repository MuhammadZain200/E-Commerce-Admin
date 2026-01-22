import axios from './axios';

const API_BASE = '/api/orders';

export const fetchOrders = () => axios.get(API_BASE);
export const fetchOrderById = (id) => axios.get(`${API_BASE}/${id}`);
export const createOrder = (data) => axios.post(API_BASE, data);
export const updateOrderStatus = (id, status) => axios.patch(`${API_BASE}/${id}/status`, { status });

