const Agentinfo = require("../models/agentname");
const mongoose = require('mongoose'); // Make sure mongoose is imported

async function createAgent(req, res) {
    try {
      const { name } = req.body;
  
      // Ensure all required fields are provided
      if (!name) {
        return res.status(400).json({ error: "name is required." });
      }
  
      // Create the village document
      const agentCreate = await Agentinfo.create({ name });
      res.status(200).json({ data: agentCreate });
    } catch (error) {
      res.status(500).json({ error: `Error while creating agent: ${error.message}` });
    }
  }
  async function getAgent(req, res) {
    try {
      // Fetch all agents from the Agentinfo collection
      const agents = await Agentinfo.find();
  
      // Count the total number of agents
      const totalEntries = await Agentinfo.countDocuments();
  
      // If no agents found, return a 404 error
      if (agents.length === 0) {
        return res.status(404).json({ error: "No agents found." });
      }
  
      // Return all agents and the total count
      res.status(200).json({ 
        data: agents,
        totalEntries: totalEntries // Include total count
      });
    } catch (error) {
      // Handle any errors that occur during the database query
      res.status(500).json({ error: `Error while fetching agent details: ${error.message}` });
    }
  }
  
  
  
 

  async function updateAgentById(req, res) {
    try {
      const { id } = req.params;  // Get the ID from the request parameters
      console.log(id);
      const { name } = req.body;  // Assume we're updating the `name` field (can extend for more fields)
  
      if (!name) {
        return res.status(400).json({ error: "name is required." });
      }
  
      // Validate if the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format." });
      }
  
      // Find the agent by ID and update it
      const updatedAgent = await Agentinfo.findByIdAndUpdate(
        id,  // Filter by the MongoDB ID
        { name: name },  // Fields to update
        { new: true }  // Return the updated document
      );
  
      if (!updatedAgent) {
        return res.status(404).json({ error: "Agent not found." });
      }
  
      res.status(200).json({ data: updatedAgent });
    } catch (error) {
      res.status(500).json({ error: `Error while updating agent: ${error.message}` });
    }
  }
  
  
  async function deleteAgentById(req, res) {
    try {
      const { id } = req.params;  // Get the ID from the request parameters
  
      // Validate if the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format." });
      }
  
      // Find the agent by ID and delete it
      const deletedAgent = await Agentinfo.findByIdAndDelete(id);
  
      if (!deletedAgent) {
        return res.status(404).json({ error: "Agent not found." });
      }
  
      res.status(200).json({ message: "Agent successfully deleted." });
    } catch (error) {
      res.status(500).json({ error: `Error while deleting agent: ${error.message}` });
    }
  }
  
    


module.exports = { createAgent, getAgent, updateAgentById, deleteAgentById };
