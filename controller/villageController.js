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

    // Convert `limit` and `page` to integers, if they exist
    const limitNum = limit ? parseInt(limit) : null;  // Allow null for no limit
    const pageNum = page ? parseInt(page) : null;  // Allow null for no page

    // Validate limit and page inputs if they are provided
    if (limitNum !== null && (isNaN(limitNum) || limitNum < 1)) {
      return res.status(400).json({ error: "Invalid limit number." });
    }
    if (pageNum !== null && (isNaN(pageNum) || pageNum < 1)) {
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

    // Prepare query object for find operation
    const query = Villageinfo.find(searchFilter).sort({ [sortField]: sortOrder });

    // Apply pagination if limit and page are specified
    if (limitNum !== null && pageNum !== null) {
      const skip = (pageNum - 1) * limitNum;  // Calculate the skip value (pagination offset)
      query.skip(skip).limit(limitNum);  // Apply skip and limit
    }

    // Find the villages with search, sorting, and optional pagination
    const villages = await query;

    // Get total count of documents matching the search filter
    const totalEntries = await Villageinfo.countDocuments(searchFilter);

    // Calculate total number of pages if pagination is applied
    const totalPages = limitNum !== null ? Math.ceil(totalEntries / limitNum) : 1;

    // Send the response with total entries, total pages, and paginated data
    res.status(200).json({
      data: villages,
      totalEntries: totalEntries,  // Total number of documents
      totalPages: totalPages,      // Total number of pages (only meaningful if pagination is applied)
      currentPage: pageNum || 1,   // Current page, defaulting to 1 if not specified
      limit: limitNum || totalEntries,  // Limit per page (or show all entries)
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
