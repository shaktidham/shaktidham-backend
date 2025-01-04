const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    name:{ type: String }
  }
);

module.exports = mongoose.model("agent", agentSchema);
