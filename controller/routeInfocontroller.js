const Businfo = require("../models/routeinfo");
const villageadd = require("../models/villageadd");
const jwt = require("jsonwebtoken");

// Helper to verify token and extract decoded info
const verifyToken = (token) => {
  if (!token) throw new Error("Authorization token is required.");
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Helper to fetch village data
const getVillageMap = async (villageNames) => {
  const villageRecords = await villageadd
    .find({ village: { $in: villageNames } })
    .lean();
  return villageRecords.reduce((acc, { village, evillage }) => {
    acc[village] = evillage;
    return acc;
  }, {});
};

// Helper to update villages
const mapVillages = (array, villageMap) => {
  return array.map(({ village, point }) => ({
    village,
    evillage: villageMap[village] || null,
    point,
  }));
};

async function routeDetails(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to update bus details.",
      });
    }

    const {
      date,
      fromtime,
      droptime,
      to,
      from,
      price,
      first,
      last,
      Busname,
      location,
      driver,
      phonenumber,
      cabinprice,
      enddate,
      isshow,
    } = req.body;

    const code = `${last}-${date}`;
    const startDate = new Date(date);
    const endDate = new Date(enddate);

    if (startDate > endDate) {
      return res
        .status(400)
        .json("Start date cannot be later than the end date");
    }

    const villageNames = [...from, ...to].map((item) => item.village);
    const villageMap = await getVillageMap(villageNames);

    const updatedFrom = mapVillages(from, villageMap);
    const updatedTo = mapVillages(to, villageMap);

    const busDetails = [];
    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const busDetail = await Businfo.create({
        date: new Date(currentDate),
        fromtime,
        droptime,
        Busname,
        from: updatedFrom,
        to: updatedTo,
        price,
        first,
        last,
        location,
        phonenumber,
        driver,
        cabinprice,
        code,
        isshow,
      });
      busDetails.push(busDetail);
    }

    res.status(200).json({ data: busDetails });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    res.status(500).json(`Error while fetching details: ${error.message}`);
  }
}

async function routedelete(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to update bus details.",
      });
    }

    await Businfo.findByIdAndDelete(req.params.id);
    res.status(200).json("Route is deleted");
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    res.status(500).json(`Error while deleting route: ${error.message}`);
  }
}

async function routeread(req, res) {
  // const token = req.headers.authorization?.split(" ")[1];

  try {
    // const decoded = verifyToken(token);
    // console.log(decoded, "decoded");
    // if (decoded.role!== "superAdmin") {
    //   return res
    //     .status(403)
    //     .json({
    //       error: "Access denied. You are not authorized to view bus details.",
    //     });
    // }

    const { date, id } = req.query;

    if (id) {
      const busdetails = await Businfo.findById(id);
      if (!busdetails) {
        return res
          .status(404)
          .json({ error: "Bus details not found for the given id." });
      }
      return res.status(200).json({ data: busdetails });
    }

    if (date) {
      const dateValue = new Date(date);
      if (isNaN(dateValue)) {
        return res
          .status(400)
          .json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }

      const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));

      const busdetails = await Businfo.find({
        date: { $gte: startOfDay, $lte: endOfDay },
      });
      return res.status(200).json({ data: busdetails });
    }

    return res
      .status(400)
      .json({ error: "Either 'date' or 'id' parameter is required." });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    res
      .status(500)
      .json({ message: `Error while fetching details: ${error.message}` });
  }
}

async function routeupdate(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // Verify the token
    const decoded = verifyToken(token);

    // Authorization check: only 'vinay' is allowed to update bus details
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to update bus details.",
      });
    }

    // Extract data from the request body
    const {
      fromtime,
      droptime,
      to,
      from,
      price,
      first,
      last,
      Busname,
      location,
      driver,
      phonenumber,
      cabinprice,
      isshow,
    } = req.body;

    // Validation check for required fields, excluding 'date'
    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Check if 'from' and 'to' are arrays of villages
    if (!Array.isArray(from) || !Array.isArray(to)) {
      return res
        .status(400)
        .json({ message: "'from' and 'to' must be arrays of village data." });
    }

    // Prepare the list of village names
    const villageNames = [...from, ...to].map((item) => item.village);

    // Fetch the village map based on the village names
    const villageMap = await getVillageMap(villageNames);

    // Map the villages from 'from' and 'to' using the fetched village map
    const updatedFrom = mapVillages(from, villageMap);
    const updatedTo = mapVillages(to, villageMap);

    // Extract query parameters (codes or id)
    const codes = req.query.codes ? req.query.codes.split(",") : [];
    const id = req.query.id;

    // Validation: Ensure either codes or id is provided
    if (codes.length === 0 && !id) {
      return res.status(400).json({ message: "Bus codes or id are required" });
    }

    // Construct filter based on codes or id
    // let filter = {};
    // if (codes.length > 0) {
    //   filter.code = { $in: codes };
    // } else if (id) {
    //   filter._id = id;
    // }

    // // Perform the update operation using findOneAndUpdate (excluding 'date')
    // const busDetails = await Businfo.updateMany(
    //   filter,
    //   {
    //     fromtime,
    //     droptime,
    //     from: updatedFrom,
    //     to: updatedTo,
    //     Busname,
    //     price,
    //     first,
    //     last,
    //     location,
    //     driver,
    //     cabinprice,
    //     isshow,
    //   },
    //   { new: true, runValidators: true } // new: returns the updated document, runValidators: ensure validation is applied
    // );
    let filter = {};

    if (codes.length > 0) {
      filter.code = { $in: codes }; // When codes are provided, filter by code
    } else if (id) {
      filter._id = id; // If id is provided, filter by id
    }

    let updateFields = {};

    // If codes are provided, update only the specified fields
    if (codes.length > 0) {
      updateFields = {
        fromtime,
        droptime,
        from: updatedFrom,
        to: updatedTo,
      };
    } else if (id) {
      // If id is provided, update all fields
      updateFields = {
        fromtime,
        droptime,
        from: updatedFrom,
        to: updatedTo,
        Busname,
        price,
        first,
        last,
        location,
        driver,
        phonenumber,
        cabinprice,
        isshow,
      };
    }

    // Perform the update operation
    const busDetails = await Businfo.updateMany(
      filter,
      updateFields,
      { new: true, runValidators: true } // Ensures the validation is run and returns the updated documents
    );

    // If no bus details are found or updated
    if (!busDetails) {
      return res
        .status(404)
        .json({ message: "No bus details found for the provided codes or id" });
    }

    // Successfully updated bus details
    res
      .status(200)
      .json({ message: "Bus details updated successfully", data: busDetails });
  } catch (error) {
    // Handle token-related errors
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    // General error handling
    res
      .status(500)
      .json({ message: `Error while updating bus details: ${error.message}` });
  }
}

async function routereadid(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view bus details.",
      });
    }

    const { date, id } = req.query;

    if (id) {
      const busdetails = await Businfo.findById(id);
      if (!busdetails) {
        return res
          .status(404)
          .json({ error: "Bus details not found for the given id." });
      }
      return res.status(200).json({ data: busdetails });
    }

    if (date) {
      const dateValue = new Date(date);
      if (isNaN(dateValue)) {
        return res
          .status(400)
          .json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }

      const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));

      const busdetails = await Businfo.find(
        { date: { $gte: startOfDay, $lte: endOfDay } },
        "_id Busname"
      );

      return res.status(200).json({ data: busdetails });
    }

    return res
      .status(400)
      .json({ error: "Either 'date' or 'id' parameter is required." });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    res
      .status(500)
      .json({ message: `Error while fetching details: ${error.message}` });
  }
}

module.exports = {
  routeDetails,
  routeupdate,
  routeread,
  routedelete,
  routereadid,
};
