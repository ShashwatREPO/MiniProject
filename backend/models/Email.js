// models/Email.js
const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    subject: { type: String, default: "(no subject)" },
    body: String,
    folder: {
      type: String,
      enum: ["inbox", "sent", "spam", "trash"], // Added trash
      default: "inbox",
      required: true,
    },
    isRead: { type: Boolean, default: false },
    sender: {
      // Store sender info directly or reference User
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      // Store recipient info directly or reference User
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Removed sentAt, using timestamps: true instead
  },
  {
    timestamps: { createdAt: "sentAt", updatedAt: true }, // Use createdAt as sentAt
  },
);

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
