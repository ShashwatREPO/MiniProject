// server.js
const express = require("express");
const bodyParser = require("body-parser"); // Use express.json() instead
const cors = require("cors"); // Enable CORS for frontend interaction
const connectDB = require("./config/db");
const config = require("./config");
const mainRouter = require("./routes"); // Import the main router

// Connect to Database
connectDB();

const app = express();

// --- Core Middleware ---
// Enable CORS - Configure origins properly for production
app.use(cors()); // Allows all origins by default - restrict in production!
// Example: app.use(cors({ origin: 'http://your-frontend-domain.com' }));

// Body Parsing Middleware
app.use(express.json()); // Replaces bodyParser.json()
app.use(express.urlencoded({ extended: true })); // For form data if needed

// --- API Routes ---
// Mount the main router under the /api prefix
app.use("/api", mainRouter);

// --- Basic Root Route (Optional) ---
app.get("/", (req, res) => {
  res.send("Email Client API Running");
});

// --- Not Found Handler (Should be after all routes) ---
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found - The requested resource does not exist" });
});

// --- Global Error Handler (Should be last) ---
// Catches errors passed via next(error)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  // Avoid sending detailed stack trace in production
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
                  ? 'Internal Server Error'
                  : err.message || 'Something went wrong';

  res.status(statusCode).json({ message });
});


// --- Start Server ---
const server = app.listen(config.port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${config.port}`);
}).on("error", (err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});

// --- Graceful Shutdown Handling ---
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  // Close server & exit process
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Close server & exit process
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    // Close database connection if needed here
    process.exit(0)
  })
})
