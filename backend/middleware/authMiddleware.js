// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Get user from the token payload (excluding password)
      // Attach user object to the request
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
         // If user associated with token doesn't exist anymore
         return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next(); // Proceed to the next middleware/controller
    } catch (error) {
      console.error("Token Verification Error:", error.message);
       if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Not authorized, invalid token" });
       }
       if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Not authorized, token expired" });
       }
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
