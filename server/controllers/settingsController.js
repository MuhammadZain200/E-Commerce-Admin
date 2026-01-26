// File: controllers/settingsController.js
//
// Settings Controller - Handles GET and PUT requests for settings
// Only admin users can access these endpoints

const Settings = require('../models/Settings');

// ============================================
// GET /api/admin/settings
// ============================================
// Returns current settings (admin only)
exports.getSettings = async (req, res) => {
  try {
    // Get or create settings document
    const settings = await Settings.getSettings();
    
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message,
    });
  }
};

// ============================================
// PUT /api/admin/settings
// ============================================
// Updates settings (admin only)
exports.updateSettings = async (req, res) => {
  try {
    const {
      storeName,
      currency,
      taxRate,
      autoCancelMinutes,
      allowStatusSkipping,
      allowEditingPaidOrders,
    } = req.body;

    // Validation object to build
    const updates = {};

    // Validate and add each field if provided
    if (storeName !== undefined) {
      if (typeof storeName !== 'string' || storeName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Store name must be a non-empty string',
        });
      }
      if (storeName.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Store name cannot exceed 100 characters',
        });
      }
      updates.storeName = storeName.trim();
    }

    if (currency !== undefined) {
      if (typeof currency !== 'string' || currency.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Currency must be a non-empty string',
        });
      }
      updates.currency = currency.trim().toUpperCase();
    }

    if (taxRate !== undefined) {
      const taxRateNum = Number(taxRate);
      if (isNaN(taxRateNum)) {
        return res.status(400).json({
          success: false,
          message: 'Tax rate must be a number',
        });
      }
      if (taxRateNum < 0 || taxRateNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Tax rate must be between 0 and 100',
        });
      }
      updates.taxRate = taxRateNum;
    }

    if (autoCancelMinutes !== undefined) {
      const minutesNum = Number(autoCancelMinutes);
      if (isNaN(minutesNum)) {
        return res.status(400).json({
          success: false,
          message: 'Auto-cancel minutes must be a number',
        });
      }
      if (minutesNum < 0 || minutesNum > 10080) {
        return res.status(400).json({
          success: false,
          message: 'Auto-cancel minutes must be between 0 and 10080 (1 week)',
        });
      }
      updates.autoCancelMinutes = minutesNum;
    }

    if (allowStatusSkipping !== undefined) {
      if (typeof allowStatusSkipping !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'allowStatusSkipping must be a boolean',
        });
      }
      updates.allowStatusSkipping = allowStatusSkipping;
    }

    if (allowEditingPaidOrders !== undefined) {
      if (typeof allowEditingPaidOrders !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'allowEditingPaidOrders must be a boolean',
        });
      }
      updates.allowEditingPaidOrders = allowEditingPaidOrders;
    }

    // If no updates provided, return error
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    // Update settings
    const settings = await Settings.updateSettings(updates);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};

