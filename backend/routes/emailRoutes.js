// routes/emailRoutes.js
const express = require("express");
const emailController = require("../controllers/emailController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protect middleware to all email routes
router.use(protect);

// POST /api/emails/send - Send a new email
router.post("/send", emailController.sendEmail);

// GET /api/emails/folder/:folder - Get emails from a specific folder (inbox, sent, spam, trash)
router.get("/folder/:folder", emailController.getEmailsByFolder);

// GET /api/emails/:emailId - Get a specific email by its ID
router.get("/:emailId", emailController.getEmailById);

// PUT /api/emails/:emailId/read - Mark an email as read/unread
router.put("/:emailId/read", emailController.updateEmail); // Changed route for clarity

// POST /api/emails/:emailId/move - Move an email to a different folder
router.post("/:emailId/move", emailController.moveEmailToFolder);

// DELETE /api/emails/:emailId - Delete a specific email (moves to trash or permanently deletes)
router.delete("/:emailId", emailController.deleteEmail);

// DELETE /api/emails/folder/:folder/empty - Permanently delete all emails in spam or trash
router.delete("/folder/:folder/empty", emailController.emptyFolder);


module.exports = router;
