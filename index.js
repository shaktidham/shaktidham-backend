const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

const seats = require("./routes/seatRoute");
const busInfo = require("./routes/BusInfoRoute");
const routeInfo = require("./routes/Routeinfo");
const auth = require("./routes/authRoute");
const village = require("./routes/villageRoute");
const agent = require("./routes/agent");

env.config();

const app = express();
const port = process.env.PORT || 3002;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/seats", seats);
app.use("/bus", busInfo);
app.use("/route", routeInfo);
app.use("/auth", auth);
app.use("/village", village);
app.use("/agent", agent);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
