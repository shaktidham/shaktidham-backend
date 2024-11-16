const Villageinfo = require("../models/villageadd");

async function villageDetails(req, res) {
  try {
    const { village, point } = req.body;

    if (!village || !point) {
      return res.status(400).json({ error: "Village and Point are required." });
    }

    const villagecreate = await Villageinfo.create({ village, point });
    res.status(200).json({ data: villagecreate });
  } catch (error) {
    res.status(500).json({ error: `Error while creating details: ${error.message}` });
  }
}

async function villageread(req, res) {
  try {
    // Destructure query parameters for search, sorting, and limit
    const { limit = 10, search = '', sortBy = 'village', order = 'asc' } = req.query;

    // Convert `limit` to an integer
    const limitNum = parseInt(limit);

    // Validate limit input
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ error: "Invalid limit number." });
    }

    // Create search filter if search term is provided
    const searchFilter = search
      ? { $or: [{ village: { $regex: search, $options: 'i' } }, { point: { $regex: search, $options: 'i' } }] }
      : {};

    // Determine sort order (1 for ascending, -1 for descending)
    const sortOrder = order === 'desc' ? -1 : 1;

    // Find the villages with search, sorting, and limit
    const villages = await Villageinfo.find(searchFilter)
      .sort({ [sortBy]: sortOrder })
      .limit(limitNum);

    // Send the response
    res.status(200).json({
      data: villages,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({ error: `Error while reading details: ${error.message}` });
  }
}

async function villagedelete(req, res) {
  try {
    const deletedVillage = await Villageinfo.findByIdAndDelete(req.params.id);
    if (!deletedVillage) {
      return res.status(404).json({ error: "Village not found." });
    }
    res.status(200).json({ message: "Village deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: `Error while deleting details: ${error.message}` });
  }
}

async function villageUpdate(req, res) {
  try {
    const { village, point } = req.body;

    if (!village || !point) {
      return res.status(400).json({ error: "Village and Point are required." });
    }

    const updatedVillage = await Villageinfo.findByIdAndUpdate(
      req.params.id,
      { village, point },
      { new: true }
    );

    if (!updatedVillage) {
      return res.status(404).json({ error: "Village not found." });
    }

    res.status(200).json({ data: updatedVillage });
  } catch (error) {
    res.status(500).json({ error: `Error while updating details: ${error.message}` });
  }
}

module.exports = { villageDetails, villageread, villagedelete, villageUpdate };
