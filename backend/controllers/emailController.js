// controllers/emailController.js
const Email = require("../models/Email");
const User = require("../models/User"); // Needed to validate recipient

// Helper function to format email list response
const formatEmailList = (emails, userPerspective) => {
  return emails.map((email) => ({
    id: email._id,
    subject: email.subject,
    sentAt: email.sentAt, // Keep ISO string or format as needed on client
    isRead: email.isRead,
    // Conditionally add sender/recipient based on perspective
    ...(userPerspective === "recipient" && { senderId: email.sender }), // Populate later if needed
    ...(userPerspective === "sender" && { recipientId: email.recipient }), // Populate later if needed
  }));
};

// --- Email Sending ---

exports.sendEmail = async (req, res) => {
  try {
    const senderId = req.user.id; // Sender is the authenticated user
    const { recipientEmail, subject, body } = req.body;

    if (!recipientEmail || !body) {
      // Subject can be optional
      return res
        .status(400)
        .json({ message: "Recipient email and body are required" });
    }

    // Find recipient user by email
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    // Prevent sending email to oneself (optional rule)
    if (recipient._id.equals(senderId)) {
      return res.status(400).json({ message: "Cannot send email to yourself" });
    }

    // Create email for the sender (in their 'sent' folder)
    const sentEmail = new Email({
      sender: senderId,
      recipient: recipient._id,
      subject,
      body,
      folder: "sent", // Sender's copy is in 'sent'
      isRead: true, // Sender's copy is implicitly read
    });
    await sentEmail.save();

    // Create email for the recipient (in their 'inbox' folder)
    const inboxEmail = new Email({
      sender: senderId,
      recipient: recipient._id,
      subject,
      body,
      folder: "inbox", // Recipient's copy is in 'inbox'
      isRead: false,
    });
    await inboxEmail.save(); // In a real app, consider transactions or handling failure

    res.status(201).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Send Email Error:", error);
    res
      .status(500)
      .json({ message: "Error sending email", error: error.message });
  }
};

// --- Fetching Emails ---

exports.getEmailsByFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folder } = req.params; // Get folder from URL parameter

    if (!["inbox", "sent", "spam", "trash"].includes(folder)) {
      return res.status(400).json({ message: "Invalid folder specified" });
    }

    let query = {};
    let userPerspective = "";

    if (folder === "inbox" || folder === "spam" || folder === "trash") {
      query = { recipient: userId, folder: folder };
      userPerspective = "recipient";
    } else if (folder === "sent") {
      query = { sender: userId, folder: folder };
      userPerspective = "sender";
    } else {
      // Should not happen due to validation above, but good practice
      return res.status(400).json({ message: "Invalid folder logic" });
    }

    // Add pagination later: .limit(limit).skip(skip)
    const emails = await Email.find(query)
      .populate("sender", "email fullName") // Populate sender info
      .populate("recipient", "email fullName") // Populate recipient info
      .sort({ sentAt: -1 }); // Sort by sentAt descending

    // Format based on perspective (simplified for now)
    const formattedEmails = emails.map((email) => ({
      id: email._id,
      subject: email.subject,
      bodySnippet: email.body ? email.body.substring(0, 100) + "..." : "", // Add snippet
      sentAt: email.sentAt,
      isRead: email.isRead,
      sender: email.sender ? { id: email.sender._id, email: email.sender.email, fullName: email.sender.fullName } : null,
      recipient: email.recipient ? { id: email.recipient._id, email: email.recipient.email, fullName: email.recipient.fullName } : null,
      folder: email.folder,
    }));


    res.status(200).json({ [folder]: formattedEmails });
  } catch (error) {
    console.error(`Get ${req.params.folder} Error:`, error);
    res
      .status(500)
      .json({ message: `Error fetching ${req.params.folder}`, error: error.message });
  }
};


exports.getEmailById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailId } = req.params;

    const email = await Email.findById(emailId)
      .populate("sender", "email fullName") // Populate sender info
      .populate("recipient", "email fullName"); // Populate recipient info

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Security check: Ensure the logged-in user is either the sender or recipient
    if (!email.sender._id.equals(userId) && !email.recipient._id.equals(userId)) {
      return res.status(403).json({ message: "Forbidden: You cannot access this email" });
    }

    // Optionally mark as read if the recipient views it
    if (email.recipient._id.equals(userId) && !email.isRead && email.folder === 'inbox') {
        email.isRead = true;
        await email.save();
    }


    res.status(200).json({
      id: email._id,
      subject: email.subject,
      body: email.body,
      sentAt: email.sentAt,
      isRead: email.isRead,
      folder: email.folder,
      sender: email.sender ? { id: email.sender._id, email: email.sender.email, fullName: email.sender.fullName } : null,
      recipient: email.recipient ? { id: email.recipient._id, email: email.recipient.email, fullName: email.recipient.fullName } : null,
    });
  } catch (error) {
    console.error("Get Email By ID Error:", error);
    // Handle CastError for invalid ObjectId format
    if (error.name === 'CastError') {
        return res.status(400).json({ message: "Invalid Email ID format" });
    }
    res
      .status(500)
      .json({ message: "Error fetching email", error: error.message });
  }
};

// --- Modifying Emails ---

exports.updateEmail = async (req, res) => {
  // Primarily used for marking as read/unread, moving folder handled separately
  try {
    const userId = req.user.id;
    const { emailId } = req.params;
    const { isRead } = req.body; // Only allow updating 'isRead' via this endpoint

    if (typeof isRead !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid value for 'isRead'. Must be true or false." });
    }

    // Find the email and ensure the user is the recipient
    const email = await Email.findOne({ _id: emailId, recipient: userId });

    if (!email) {
      return res
        .status(404)
        .json({ message: "Email not found or you are not the recipient." });
    }

    // Prevent marking 'sent' items as unread/read via this method if desired
    // if (email.folder === 'sent') {
    //   return res.status(400).json({ message: "Cannot change read status of sent emails." });
    // }

    email.isRead = isRead;
    await email.save();

    res.status(200).json({ message: "Email read status updated successfully" });
  } catch (error) {
    console.error("Update Email Error:", error);
     if (error.name === 'CastError') {
        return res.status(400).json({ message: "Invalid Email ID format" });
    }
    res
      .status(500)
      .json({ message: "Error updating email", error: error.message });
  }
};

exports.moveEmailToFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailId } = req.params;
    const { folder } = req.body;

    if (!["inbox", "spam", "trash"].includes(folder)) {
      // User can only move *received* emails (inbox, spam, trash)
      // Moving to 'sent' doesn't make sense contextually here.
      return res.status(400).json({ message: "Invalid target folder. Can only move to inbox, spam, or trash." });
    }

    // Find the email and ensure the user is the recipient
    // Allow moving from inbox, spam, or trash
    const email = await Email.findOne({
        _id: emailId,
        recipient: userId,
        folder: { $in: ["inbox", "spam", "trash"] }
    });

    if (!email) {
      return res
        .status(404)
        .json({ message: "Email not found, you are not the recipient, or it's not in a movable folder (inbox/spam/trash)." });
    }

    if (email.folder === folder) {
        return res.status(200).json({ message: `Email is already in the ${folder} folder.` });
    }

    email.folder = folder;
    // Optionally reset isRead status when moving out of trash?
    // if (folder !== 'trash' && email.isRead) {
    //   // Decide on business logic
    // }
    await email.save();

    res.status(200).json({ message: `Email moved successfully to ${folder}` });
  } catch (error) {
    console.error("Move Email Error:", error);
     if (error.name === 'CastError') {
        return res.status(400).json({ message: "Invalid Email ID format" });
    }
    res
      .status(500)
      .json({ message: "Error moving email", error: error.message });
  }
};


// --- Deleting Emails ---

exports.deleteEmail = async (req, res) => {
  // This should probably move to 'trash' first, then have a separate permanent delete
  // For simplicity, we'll implement permanent delete for now.
  // Consider implementing a 'trash' folder and soft delete.
  try {
    const userId = req.user.id;
    const { emailId } = req.params;

    // Find the email and ensure the user is either the sender or recipient
    const email = await Email.findOne({
        _id: emailId,
        $or: [{ sender: userId }, { recipient: userId }]
    });

    if (!email) {
      return res
        .status(404)
        .json({ message: "Email not found or you are not authorized to delete it." });
    }

    // --- Trash Logic (Recommended) ---
    // if (email.folder !== 'trash') {
    //     email.folder = 'trash';
    //     await email.save();
    //     return res.status(200).json({ message: "Email moved to trash" });
    // } else {
    //     // If already in trash, then permanently delete
    //     await Email.findByIdAndDelete(emailId);
    //     return res.status(200).json({ message: "Email permanently deleted" });
    // }
    // --- End Trash Logic ---


    // --- Direct Permanent Delete (Simpler, as per original code) ---
    await Email.findByIdAndDelete(emailId);
    res.status(200).json({ message: "Email permanently deleted successfully" });
     // --- End Direct Delete ---

  } catch (error) {
    console.error("Delete Email Error:", error);
     if (error.name === 'CastError') {
        return res.status(400).json({ message: "Invalid Email ID format" });
    }
    res
      .status(500)
      .json({ message: "Error deleting email", error: error.message });
  }
};


exports.emptyFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folder } = req.params;

    if (!["spam", "trash"].includes(folder)) {
      // Typically only allow emptying spam or trash
      return res.status(400).json({ message: "Can only empty spam or trash folders." });
    }

    let query = {};
    if (folder === "spam" || folder === "trash") {
        // These folders contain emails where the user is the recipient
        query = { recipient: userId, folder: folder };
    } else {
        // Add logic for other folders if needed, e.g., emptying 'sent' (less common)
         return res.status(400).json({ message: "Invalid folder specified for emptying." });
    }


    const result = await Email.deleteMany(query);

    res.status(200).json({
      message: `Deleted ${result.deletedCount} emails from ${folder}`,
    });
  } catch (error) {
    console.error(`Empty Folder ${req.params.folder} Error:`, error);
    res
      .status(500)
      .json({ message: `Error emptying ${req.params.folder}`, error: error.message });
  }
};
