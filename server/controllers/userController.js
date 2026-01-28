// File: controllers/userController.js
//
// User Management Controller - Handles user listing, activation, and role changes
// Only admin users can access these endpoints

const User = require('../models/User');

// ============================================
// GET /api/admin/users
// ============================================
// Returns list of all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    // Get all users, exclude password field, populate assignedByAdmin info
    const users = await User.find({})
      .select('-password') // Don't send password to frontend
      .populate('assignedByAdmin', 'name email') // Populate who assigned admin role
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

// ============================================
// PATCH /api/admin/users/:id/activate
// ============================================
// Activate a user (set isActive = true)
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot activate/deactivate yourself',
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message,
    });
  }
};

// ============================================
// PATCH /api/admin/users/:id/deactivate
// ============================================
// Deactivate a user (set isActive = false)
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot activate/deactivate yourself',
      });
    }

    // Prevent deactivating the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last active admin',
        });
      }

      // Check if current admin is the one who assigned admin role
      // Only the assigning admin can deactivate this admin
      if (user.assignedByAdmin && user.assignedByAdmin.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You cannot deactivate this admin. Only the admin who assigned this role can deactivate this account.',
        });
      }
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message,
    });
  }
};

// ============================================
// PATCH /api/admin/users/:id/role
// ============================================
// Change user role (admin | user)
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: admin, user',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent changing your own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    // If user is currently an admin and we're trying to change their role
    if (user.role === 'admin') {
      // If trying to remove admin role, check permissions
      if (role !== 'admin') {
        // Prevent removing admin role from the last admin
        const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot remove admin role from the last active admin',
          });
        }

        // Check if current admin is the one who assigned admin role
        // Only the assigning admin can revoke admin rights
        if (user.assignedByAdmin && user.assignedByAdmin.toString() !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'You cannot change this admin\'s role. Only the admin who assigned this role can modify or delete this account.',
          });
        }
      }
    }

    // Update role
    const previousRole = user.role;
    user.role = role;

    // If promoting to admin, track who assigned the role
    if (role === 'admin' && previousRole !== 'admin') {
      user.assignedByAdmin = req.user.id;
    }

    // If demoting from admin, clear assignedByAdmin
    if (role !== 'admin' && previousRole === 'admin') {
      user.assignedByAdmin = null;
    }

    await user.save();

    res.json({
      success: true,
      message: `User role changed to ${role} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        assignedByAdmin: user.assignedByAdmin,
      },
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change user role',
      error: error.message,
    });
  }
};

// ============================================
// DELETE /api/admin/users/:id
// ============================================
// Delete a user account (admin only)
// Only the admin who assigned the admin role can delete that admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    // If user is an admin, check if current admin is the one who assigned the role
    if (user.role === 'admin') {
      // Prevent deleting the last admin
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last active admin',
        });
      }

      // Check if current admin is the one who assigned admin role
      // Only the assigning admin can delete this admin account
      if (user.assignedByAdmin && user.assignedByAdmin.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You cannot delete this admin account. Only the admin who assigned this role can delete this account.',
        });
      }
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

