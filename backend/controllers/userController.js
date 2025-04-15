// controllers/userController.js
const User = require("../models/User");
const Email = require("../models/Email");
const bcrypt = require("bcrypt");

// Middleware should place user ID in req.user.id
// This controller assumes authMiddleware runs before it

exports.getUserProfile = async (req, res) => {
  try {
    // Use ID from authenticated token, not params unless for admin purposes
    const userId = req.user.id; // Assumes authMiddleware sets req.user
    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      // This shouldn't happen if token is valid, but good practice
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id, // Use id consistently
      email: user.email, // Use email consistently
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Get User Profile Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Use ID from authenticated token
    const { email, password, fullName } = req.body;
    const updates = {};

    // Add validation if necessary (e.g., email format)
    if (email) updates.email = email;
    if (fullName) updates.fullName = fullName;
    if (password) {
      // Add password complexity checks if needed
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    // Prevent updating fields that shouldn't be updated here
    delete updates._id;
    delete updates.createdAt;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    // Find and update, return the new document, run validators
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        // Return updated user data (excluding password)
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Update User Profile Error:", error);
    // Handle potential duplicate email error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res
      .status(500)
      .json({ message: "Error updating user profile", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id; // Use ID from authenticated token

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete associated emails (consider moving this to a background job for large amounts)
    await Email.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });

    res.status(200).json({ message: "User and associated emails deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};
