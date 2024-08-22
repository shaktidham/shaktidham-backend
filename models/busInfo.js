const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    price: { type: Number },
    busNumber: { type: String },
    location: { type: String },
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Routeinfo" },
    date: { type: Date },
    driver: { type: String },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Businfo", seatSchema);
