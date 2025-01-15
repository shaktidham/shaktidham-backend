const mongoose = require("mongoose");

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,   // This makes email mandatory
      unique: true,     // This ensures that no two users can have the same email
    },
    password: {
      type: String,
      required: true,   // This makes password mandatory
    },
    role: {
      type: String,     // Role is optional (no "required" constraint)
    },
    lastLoginIp: { type: String, default: null }, 
    jwtToken: { type: String },
  },
  {
    timestamps: true,   // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Export the User model
module.exports = mongoose.model("User", userSchema);
