// File: models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

// 1️⃣ Define User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true, // Remove extra spaces
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Prevent duplicates
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Basic email validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff',
  },
}, { timestamps: true });

// 2️⃣ Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next();
  } catch (err) {
    next(err);
  }
});

// 3️⃣ Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 4️⃣ Export the model
module.exports = mongoose.model('User', userSchema);
