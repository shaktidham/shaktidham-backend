const SeatModel = require("../models/bookedseat");
const Businfo = require("../models/busInfo");
const Routeinfo = require("../models/routeinfo");
async function getsearchAll(req, res) {
  try {
    // Extract the Date parameter from the query string
    const { Date: dateStr, route } = req.query;

    // Initialize an empty filter object
    const filter = {};
    const ExsitingRoute = await Routeinfo.findOne({ route });

    // Add date range filter if the date is provided
    if (dateStr) {
      // Parse the date string into a Date object
      const dateValue = new Date(dateStr);

      // Check if the date conversion is valid
      if (!isNaN(dateValue.getTime())) {
        // Define the start and end of the day
        const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));

        // Create a filter to match documents where the date is within the specified date range
        filter.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      } else {
        return res
          .status(400)
          .json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }
    }

    // Build the aggregation pipeline
    const pipeline = [];

    // Add $match stage to the pipeline if there's a valid filter
    if (Object.keys(filter).length > 0) {
      pipeline.push({
        $match: filter,
      });
    }
    pipeline.push(
      {
        $match: {
          route: ExsitingRoute._id,
        },
      },
      {
        $lookup: {
          from: "routeinfos", // The collection to join
          localField: "route", // Field from the `orders` collection
          foreignField: "_id", // Field from the `customers` collection
          as: "routeDetails", // Output array field name
        },
      },
      {
        $unwind: "$routeDetails", // Unwind the array to merge customer details
      }
    );
    console.log("pipeline", pipeline);

    // Run the aggregation pipeline
    const documents = await SeatModel.aggregate(pipeline);

    return res.status(200).json({
      data: documents,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function getsearchBus(req, res) {
  try {
    // Extract the Date parameter from the query string
    const { Date: dateStr, route } = req.query;

    // Initialize an empty filter object
    const filter = {};
    const ExsitingRoute = await Routeinfo.findOne({ route });

    // Add date range filter if the date is provided
    if (dateStr) {
      // Parse the date string into a Date object
      const dateValue = new Date(dateStr);

      // Check if the date conversion is valid
      if (!isNaN(dateValue.getTime())) {
        // Define the start and end of the day
        const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));

        // Create a filter to match documents where the date is within the specified date range
        filter.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      } else {
        return res
          .status(400)
          .json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }
    }

    // Build the aggregation pipeline
    const pipeline = [];

    // Add $match stage to the pipeline if there's a valid filter
    if (Object.keys(filter).length > 0) {
      pipeline.push({
        $match: filter,
      });
    }
    pipeline.push(
      {
        $match: {
          route: ExsitingRoute._id,
        },
      },
      {
        $lookup: {
          from: "routeinfos", // The collection to join
          localField: "route", // Field from the `orders` collection
          foreignField: "_id", // Field from the `customers` collection
          as: "routeDetails", // Output array field name
        },
      },
      {
        $unwind: "$routeDetails", // Unwind the array to merge customer details
      }
    );

    // Run the aggregation pipeline
    const documents = await Businfo.aggregate(pipeline);

    return res.status(200).json({
      data: documents,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { getsearchAll, getsearchBus };
