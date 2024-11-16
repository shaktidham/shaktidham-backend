const mongoose = require("mongoose");

const VillageSchema = new mongoose.Schema(
  {
    village: { type: String, required: true },
    point: [{ type: String, required: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Village", VillageSchema);
