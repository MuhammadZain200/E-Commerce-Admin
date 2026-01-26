import api from './axios';

const API_BASE = '/api/admin/analytics';

/**
 * Fetch analytics data from the backend
 * Returns: { totalSales, pendingOrders, topProducts }
 * Only accessible to admin users
 */
export const fetchAnalytics = () => api.get(API_BASE);

