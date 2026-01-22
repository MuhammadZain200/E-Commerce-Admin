import axios from './axios';

const API_BASE = '/api/admin';

export const fetchDashboardStats = () => axios.get(`${API_BASE}/dashboard/stats`);

