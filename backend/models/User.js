// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6, // Add minimum password length validation
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

// Add pre-save hook for updatedAt if needed (though timestamps: true handles it)
// userSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// Consider adding methods for password comparison if needed elsewhere
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
