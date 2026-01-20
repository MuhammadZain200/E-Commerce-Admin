const express = require('express');
const router = express.Router();

// Import middlewares
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ✅ Test route
router.get(
  '/test',
  protect,               // 1️⃣ Check if user is logged in
  roleMiddleware('admin'), // 2️⃣ Check if user role is "admin"
  (req, res) => {
    res.json({ message: 'Access granted: Welcome Admin!' });
  }
);

module.exports = router;
