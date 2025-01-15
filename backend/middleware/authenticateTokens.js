const jwt = require("jsonwebtoken");

// Middleware to validate a JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT using secret key
    req.player = verified; // Attach decoded player data to request object
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;
