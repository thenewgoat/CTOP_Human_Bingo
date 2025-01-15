const jwt = require("jsonwebtoken");

// Middleware to decode token, but don't block for missing or invalid tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    req.player = null; // No token provided, proceed as a guest user
    return next();
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.player = verified; // Attach decoded token data to request object
  } catch (err) {
    req.player = null; // Invalid or expired token, treat as guest user
  }

  next(); // Proceed to the next middleware or route handler
};

module.exports = authenticateToken;
