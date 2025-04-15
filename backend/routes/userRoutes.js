// routes/userRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); // Import protect middleware

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

// GET /api/users/profile - Get current user's profile
router.get("/profile", userController.getUserProfile);

// PUT /api/users/profile - Update current user's profile
router.put("/profile", userController.updateUserProfile);

// DELETE /api/users/profile - Delete current user's account
router.delete("/profile", userController.deleteUser);

// Note: Removed routes using :userId in params, favoring operations on the authenticated user.
// If admin routes are needed later to manage *other* users, they can be added separately
// e.g., router.get('/:userId', adminMiddleware, userController.getSpecificUserProfile);

module.exports = router;
