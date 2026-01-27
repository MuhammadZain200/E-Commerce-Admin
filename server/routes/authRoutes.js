const express = require('express');
const { register, login, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register route
router.post('/register', register);

router.post('/login', login);

// Protected routes - users can update their own profile
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;