// File: routes/settingsRoutes.js
//
// Settings Routes - Admin-only routes for managing settings and users

const express = require('express');
const router = express.Router();

// Import middlewares
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Import controllers
const { getSettings, updateSettings } = require('../controllers/settingsController');
const {
  getUsers,
  activateUser,
  deactivateUser,
  changeUserRole,
  deleteUser,
} = require('../controllers/userController');

// ============================================
// SETTINGS ROUTES (Admin only)
// ============================================

// GET /api/admin/settings - Get current settings
router.get('/settings', protect, roleMiddleware('admin'), getSettings);

// PUT /api/admin/settings - Update settings
router.put('/settings', protect, roleMiddleware('admin'), updateSettings);

// ============================================
// USER MANAGEMENT ROUTES (Admin only)
// ============================================

// GET /api/admin/users - Get all users
router.get('/users', protect, roleMiddleware('admin'), getUsers);

// PATCH /api/admin/users/:id/activate - Activate a user
router.patch('/users/:id/activate', protect, roleMiddleware('admin'), activateUser);

// PATCH /api/admin/users/:id/deactivate - Deactivate a user
router.patch('/users/:id/deactivate', protect, roleMiddleware('admin'), deactivateUser);

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', protect, roleMiddleware('admin'), changeUserRole);

// DELETE /api/admin/users/:id - Delete user account
router.delete('/users/:id', protect, roleMiddleware('admin'), deleteUser);

module.exports = router;

