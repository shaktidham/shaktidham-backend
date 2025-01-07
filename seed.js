const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user"); // Adjust the path as needed

const MONGO_URI = process.env.MONGODB_URL ||  "mongodb+srv://shaktidhamtravels9:ib8B10PXVXj9mgi1@cluster0.3u4unff.mongodb.net/BusBackend"

async function seedAdminAndRole() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding.");

    const adminExists = await User.findOne({ email: "mukeshbhai" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("9999", 10);
      await User.create({
        email: "mukeshbhai",
        password: hashedPassword,
      });
      console.log("Admin user seeded successfully.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error seeding Admin and Role:", error.message);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seedAdminAndRole();
