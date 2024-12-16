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
    // Destructure query parameters for search, limit, order, and page
    const { search = '', order = 'asc' } = req.query;
    let { limit, page } = req.query;

    // Convert `limit` and `page` to integers
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);

    // Validate limit and page inputs
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ error: "Invalid limit number." });
    }
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: "Invalid page number." });
    }

    // Create search filter if search term is provided
    const searchFilter = search
      ? { $or: [{ village: { $regex: search, $options: 'i' } }, { point: { $regex: search, $options: 'i' } }] }
      : {};

    // Determine sort order (1 for ascending, -1 for descending)
    const sortOrder = order === 'desc' ? -1 : 1;

    // Default sort field: village
    const sortField = 'village';

    // Calculate the skip value (pagination offset)
    const skip = (pageNum - 1) * limitNum;

    // Find the villages with search, sorting (by 'village'), pagination (skip & limit)
    const villages = await Villageinfo.find(searchFilter)
      .sort({ [sortField]: sortOrder })
      .skip(skip) // Skip the first N records based on the page number
      .limit(limitNum); // Limit the number of records returned per page

    // Get total count of documents matching the search filter
    const totalEntries = await Villageinfo.countDocuments(searchFilter);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalEntries / limitNum);

    // Send the response with total entries, total pages, and paginated data
    res.status(200).json({
      data: villages,
      totalEntries: totalEntries, // Total number of documents
      totalPages: totalPages,     // Total number of pages
      currentPage: pageNum,       // Current page
      limit: limitNum,            // Limit per page
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
