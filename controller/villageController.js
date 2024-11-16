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
    const villageDetails = await Villageinfo.find();
    res.status(200).json({ data: villageDetails });
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
