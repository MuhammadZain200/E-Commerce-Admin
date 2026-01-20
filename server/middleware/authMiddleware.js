// File: middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware to protect routes
const protect = (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    // Header format: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(' ')[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user info to request object
    // decoded contains { id, role }
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next(); // proceed to next middleware / controller
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Optional: middleware for role-based access
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

module.exports = { protect, authorize };
