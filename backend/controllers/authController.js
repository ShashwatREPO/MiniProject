// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");

exports.signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Basic validation
    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Email, password, and full name are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
    const user = new User({ email, password: hashedPassword, fullName });
    await user.save();

    // Don't send password back, even hashed
    res.status(201).json({ message: "User registered successfully" }); // 201 Created
  } catch (error) {
    console.error("Signup Error:", error);
    res
      .status(500) // Internal Server Error for unexpected issues
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }); // 401 Unauthorized
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" }); // 401 Unauthorized
    }

    // Create token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    // Send user info along with token (optional, exclude sensitive data)
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res
      .status(500) // Internal Server Error
      .json({ message: "Error signing in", error: error.message });
  }
};
