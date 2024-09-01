const express = require("express");
const mongoose = require("mongoose");
// const Role = require('./models/admin');
const User = require("./models/user");
const bcrypt = require("bcrypt");

const app = express();

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://shaktidhamtravels9:ib8B10PXVXj9mgi1@cluster0.3u4unff.mongodb.net/BusBackend"
    // "mongodb+srv://jayp_3008:jay123@cluster0.xycjrla.mongodb.net/BusSoftware?retryWrites=true&w=majority",
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define schemas

async function seedAdminAndRole() {
  try {
    const adminPipeline = [{ $match: { username: "admin" } }];

    const admin = await User.aggregate(adminPipeline);
    if (admin.length === 0) {
      const hashedPassword = await bcrypt.hash("1812", 10);
      await User.create({
        email: "divu",
        password: hashedPassword, // Note: In a real application, hash passwords securely
      });
    }

    console.log("Admin and Role seeded successfully");
  } catch (error) {
    console.error("Error seeding Admin and Role:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedAdminAndRole();
