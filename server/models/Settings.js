// File: models/Settings.js
// 
// Settings Model - Single document to store all admin settings
// Why a single document? 
// - Settings are global configuration, not per-user
// - Easy to read/write without complex queries
// - Can be cached in memory for performance
// - Simple to backup/restore

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // ============================================
    // STORE / BUSINESS SETTINGS
    // ============================================
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      default: 'My E-Commerce Store',
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      trim: true,
      default: 'USD',
      uppercase: true,
      maxlength: [10, 'Currency code cannot exceed 10 characters'],
    },
    taxRate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
      default: 0,
      // Note: Stored as percentage (e.g., 10 means 10%)
    },
    autoCancelMinutes: {
      type: Number,
      required: [true, 'Auto-cancel minutes is required'],
      min: [0, 'Auto-cancel minutes cannot be negative'],
      max: [10080, 'Auto-cancel minutes cannot exceed 1 week (10080 minutes)'],
      default: 30,
      // Note: Time in minutes after which unpaid orders are auto-cancelled
    },

    // ============================================
    // ORDER RULE SETTINGS
    // ============================================
    allowStatusSkipping: {
      type: Boolean,
      default: false,
      // If false: orders must follow sequence (created → paid → packed → shipped → delivered)
      // If true: admins can skip statuses (e.g., created → shipped directly)
    },
    allowEditingPaidOrders: {
      type: Boolean,
      default: false,
      // If false: once an order is paid, it cannot be modified
      // If true: admins can edit paid orders (for corrections)
    },
  },
  { timestamps: true }
);

// ============================================
// STATIC METHOD: Get or Create Settings
// ============================================
// This ensures there's always exactly one settings document
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  
  // If no settings exist, create default settings
  if (!settings) {
    settings = await this.create({});
  }
  
  return settings;
};

// ============================================
// STATIC METHOD: Update Settings
// ============================================
settingsSchema.statics.updateSettings = async function (updates) {
  // Get existing settings (or create if doesn't exist)
  let settings = await this.findOne();
  
  if (!settings) {
    settings = await this.create(updates);
  } else {
    // Update only provided fields
    Object.keys(updates).forEach((key) => {
      if (settings.schema.paths[key]) {
        settings[key] = updates[key];
      }
    });
    await settings.save();
  }
  
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

