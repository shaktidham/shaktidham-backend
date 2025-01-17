const Villageinfo = require("../models/villageadd");
const jwt = require("jsonwebtoken");
const verifyToken = (token) => {
  if (!token) throw new Error("Authorization token is required.");
  return jwt.verify(token, process.env.JWT_SECRET);
};

async function villageDetails(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }

    const { village, point, evillage } = req.body;

    // Ensure all required fields are provided
    if (!village || !point || !evillage) {
      return res
        .status(400)
        .json({ error: "Village, Point, and Evillage are required." });
    }

    // Create the village document
    const villagecreate = await Villageinfo.create({
      village,
      point,
      evillage,
    });
    res.status(200).json({ data: villagecreate });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    res
      .status(500)
      .json({ error: `Error while creating details: ${error.message}` });
  }
}

async function villageread(req, res) {
  try {
    const { search = "", order = "asc" } = req.query;
    let { limit, page } = req.query;

    const limitNum = limit ? parseInt(limit) : null;
    const pageNum = page ? parseInt(page) : null;

    if (limitNum !== null && (isNaN(limitNum) || limitNum < 1)) {
      return res.status(400).json({ error: "Invalid limit number." });
    }
    if (pageNum !== null && (isNaN(pageNum) || pageNum < 1)) {
      return res.status(400).json({ error: "Invalid page number." });
    }

    // Add search for `evillage` field
    const searchFilter = search
      ? {
          $or: [
            { village: { $regex: search, $options: "i" } },
            { point: { $regex: search, $options: "i" } },
            { evillage: { $regex: search, $options: "i" } }, // Search `evillage` field too
          ],
        }
      : {};

    const sortOrder = order === "desc" ? -1 : 1;
    const sortField = "village";

    const query = Villageinfo.find(searchFilter).sort({
      [sortField]: sortOrder,
    });

    if (limitNum !== null && pageNum !== null) {
      const skip = (pageNum - 1) * limitNum;
      query.skip(skip).limit(limitNum);
    }

    const villages = await query;
    const totalEntries = await Villageinfo.countDocuments(searchFilter);
    const totalPages =
      limitNum !== null ? Math.ceil(totalEntries / limitNum) : 1;

    res.status(200).json({
      data: villages,
      totalEntries: totalEntries,
      totalPages: totalPages,
      currentPage: pageNum || 1,
      limit: limitNum || totalEntries,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Error while reading details: ${error.message}` });
  }
}

async function villagedelete(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
    const deletedVillage = await Villageinfo.findByIdAndDelete(req.params.id);
    if (!deletedVillage) {
      return res.status(404).json({ error: "Village not found." });
    }
    res.status(200).json({ message: "Village deleted successfully." });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    res
      .status(500)
      .json({ error: `Error while deleting details: ${error.message}` });
  }
}

async function villageUpdate(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
    const { village, point, evillage } = req.body;

    // Ensure all required fields are provided
    if (!village || !point || !evillage) {
      return res
        .status(400)
        .json({ error: "Village, Point, and Evillage are required." });
    }

    // Update the village document
    const updatedVillage = await Villageinfo.findByIdAndUpdate(
      req.params.id,
      { village, point, evillage },
      { new: true }
    );

    // Check if the village exists
    if (!updatedVillage) {
      return res.status(404).json({ error: "Village not found." });
    }

    res.status(200).json({ data: updatedVillage });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    res
      .status(500)
      .json({ error: `Error while updating details: ${error.message}` });
  }
}

module.exports = { villageDetails, villageread, villagedelete, villageUpdate };
