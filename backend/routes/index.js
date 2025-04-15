// routes/index.js
const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const emailRoutes = require("./emailRoutes");

const router = express.Router();

// Mount the specific routers
router.use("/auth", authRoutes);
router.use("/users", userRoutes); // Changed base path to /users
router.use("/emails", emailRoutes);

// Simple health check route
router.get("/health", (req, res) => res.status(200).send("OK"));

module.exports = router;
