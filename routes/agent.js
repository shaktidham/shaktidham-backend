const express = require("express");
const {
  createAgent,
  getAgent,
  updateAgentById,
  deleteAgentById,
} = require("../controller/agentController");

const router = express.Router();

router.post("/agents", createAgent);

// Get Agent (by name)sds
router.get("/agents", getAgent);

// Update Agent (by name)
router.put("/agents/:id", updateAgentById);

// Delete Agent (by name)
router.delete("/agents/:id", deleteAgentById);

module.exports = router;
