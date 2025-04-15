// config/db.js
const mongoose = require("mongoose");
const config = require("./index");

const connectDB = async () => {
  try {
    // Remove deprecated options
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
