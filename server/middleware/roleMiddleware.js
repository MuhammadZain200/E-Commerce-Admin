/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - list of roles allowed to access a route
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // 1️⃣ Make sure user info exists
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // 2️⃣ Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient role' });
    }

    // 3️⃣ If allowed, proceed to the next middleware / controller
    next();
  };
};

module.exports = roleMiddleware;
