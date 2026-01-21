// File: models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1️⃣ Define User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // 🔐 hide password by default
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      default: 'staff',
    },
  },
  { timestamps: true }
);

// 2️⃣ Pre-save hook to hash password (ASYNC STYLE – NO next)
userSchema.pre('save', async function () {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 3️⃣ Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 4️⃣ Export the model
module.exports = mongoose.model('User', userSchema);
