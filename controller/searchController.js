const bookedseat = require("../models/bookedseat");
const SeatModel = require("../models/bookedseat");
const Businfo = require("../models/busInfo");
const Routeinfo = require("../models/routeinfo");

async function getsearchAll(req, res) {
  try {
    // Extract parameters
    const { date: dateStr, _id } = req.query;

    const filter = {};

    // Fetch routeinfo based on routeid
    let existingRoute;
    try {
      existingRoute = await Routeinfo.findOne({ _id });
      if (!existingRoute) {
        return res.status(404).json({ error: "Route not found." });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Error fetching routeinfo from DB: " + err.message });
    }

    // Handle date filter if provided
    if (dateStr) {
      // Reformat the date string from YYYY/MM/DD to YYYY-MM-DD
      const formattedDateStr = dateStr.replace(/\//g, "-"); // Replace all slashes with hyphens
      const dateValue = new Date(formattedDateStr);

      if (isNaN(dateValue)) {
        return res
          .status(400)
          .json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }

      // Create start and end of the day
      const startOfDay = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate(),
        0,
        0,
        0,
        0
      );
      const endOfDay = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate(),
        23,
        59,
        59,
        999
      );

      // Set the date range filter
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          ...filter,
          route: existingRoute._id, // Filter by route
        },
      },
      {
        $lookup: {
          from: "routeinfos",
          localField: "route",
          foreignField: "_id",
          as: "routeDetails",
        },
      },
      {
        $project: {
          routeDetails: 0, // Exclude routeDetails field
        },
      },
    ];

    // Execute aggregation
    const documents = await SeatModel.aggregate(pipeline);

    return res.status(200).json({ data: documents });
  } catch (error) {
    console.error("Server error:", error); // Log the full error for debugging
    return res.status(500).json({ error: "Server error: " + error.message });
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
async function getsearchAllByseat(req, res) {
  try {
    const { Date: dateStr, route } = req.query;
    const filter = {};
    const ExsitingRoute = await Routeinfo.findOne({ route });

    if (dateStr) {
      const dateValue = new Date(dateStr);
      if (!isNaN(dateValue.getTime())) {
        const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));
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

    const villageOrder = [
      "અરજણસુખ",
      "ખાખરીયા",
      "સૂર્યપ્રતાપગઢ",
      "અનીડા",
      "ઉજળા",
      "મોટાઉજળા",
      "મોટીકુકાવાવ",
      "નાનીકુકાવાવ",
      "જંગર",
      "કોલડા",
      "લુણીધાર",
      "જીથુડી",
      "રાંઢીયા",
      "ચિતલ",
      "ભીલડી",
      "ભીલા",
      "ઇંગોરાળા",
      "ઇંગોરાળાપાટીયુ",
      "લુણકી",
      "તાલાળિ",
      "સનાળિ",
      "રાણસીકી",
      "દેરડી",
      "પાટખીલોરી",
      "રાવણા",
      "વાસાવડ",
      "દડવા",
      "ઝુંડાળા",
      "રાણપર",
      "ફુલજર",
      "ખીજડીયા",
      "દેવળીયા",
      "ધરાઇ",
      "વાવડી",
      "ત્રંબોડા",
      "ગમાપીપળીયા",
      "ચમારડી",
      "બાબરા",
      "ચરખા",
      "ઉટવડ",
      "નડાળા",
      "થોરખાણ",
      "ગરણી",
      "પાનસડા",
      "કર્ણુકી",
      "કોટડાપીઠા",
      "જંગવડ",
      "મોટીખીલોરી",
      "મેતાખંભાળિયા",
      "કેશવાળાપાટીયુ",
      "કમઢીયા",
      "બિલડી",
      "ડોડીયાળા",
      "સાણથલી",
      "નવાગામ",
      "જુનાપીપળીયા",
      "પીપળીયા",
      "જીવાપર",
      "પાંચવડા",
      "પાંચવડાચોકડી",
      "પાચવડા",
      "આટકોટ",
      "વાવડા",
      "ગોખલાણા",
      "શિવરાજગઢ",
      "જસદણ",
      ,
      "સૂર્યાપંપ",
      "લીલાપુર",
      "લાલાવદર",
      "વિછીયા",
      "પાળીયાદ",
      "રાણપુર",
    ];

    const villageSortOrder = villageOrder.reduce((acc, village, index) => {
      acc[village] = index;
      return acc;
    }, {});

    const pipeline = [];

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

    pipeline.push(
      {
        $addFields: {
          adjustedName: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: "$name",
                  find: "ી", // Replace Dirghai with empty string
                  replacement: "",
                },
              },
              find: "િ", // Replace Rasvai with empty string
              replacement: "",
            },
          },
          adjustedVillage: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: "$vilage",
                  find: "ી", // Replace Dirghai with empty string
                  replacement: "",
                },
              },
              find: "િ", // Replace Rasvai with empty string
              replacement: "",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            name: "$adjustedName",
            village: "$adjustedVillage",
          },
          seatNumbersArray: {
            $addToSet: "$seatNumber",
          },
          date: {
            $first: "$date",
          },

          village: {
            $first: "$vilage",
          },
          name: {
            $first: "$name",
          },
          mobile: {
            $first: "$mobile",
          },
        },
      },
      {
        $addFields: {
          villageOrderIndex: {
            $indexOfArray: [villageOrder, "$village"],
          },
        },
      },
      {
        $sort: {
          villageOrderIndex: 1,
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          village: 1,
          seatNumbersArray: 1,
          date: 1,
          uniqueSeatNumberCount: {
            $size: {
              $setUnion: [
                {
                  $map: {
                    input: "$seatNumbersArray",
                    as: "seat",
                    in: {
                      $cond: {
                        if: {
                          $regexMatch: { input: "$$seat", regex: /^કેબિન/ },
                        },
                        then: "કેબિન", // Grouping cabins together
                        else: "$$seat",
                      },
                    },
                  },
                },
                [],
              ],
            },
          },
          cabinCount: {
            $size: {
              $filter: {
                input: "$seatNumbersArray",
                as: "seat",
                cond: { $regexMatch: { input: "$$seat", regex: /^કેબિન/ } },
              },
            },
          },
          // Calculate seatCount ignoring "કેબિન" entries
          seatCount: {
            $size: {
              $reduce: {
                input: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$seatNumbersArray",
                        as: "seat",
                        cond: {
                          $not: {
                            $regexMatch: { input: "$$seat", regex: /^કેબિન/ },
                          },
                        },
                      },
                    },
                    as: "seat",
                    in: { $split: ["$$seat", ","] }, // Splitting comma-separated seat numbers
                  },
                },
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] }, // Flattening the array
              },
            },
          },
          mobile: 1,
        },
      }
    );

    const documents = await SeatModel.aggregate(pipeline);

    return res.status(200).json({
      data: documents,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function getsearchRouteByvillage(req, res) {
  try {
    const { Date: dateStr, from, to } = req.query;

    // Initialize an empty filter object
    const filter = {};

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

    // Add 'from' filter if provided
    if (from) {
      // Assume `from` can be a single value or an array
      if (Array.isArray(from)) {
        filter.from = { $in: from };
      } else {
        filter.from = from;
      }
    }

    // Add 'to' filter if provided
    if (to) {
      // Assume `to` can be a single value or an array
      if (Array.isArray(to)) {
        filter.to = { $in: to };
      } else {
        filter.to = to;
      }
    }

    // Find documents matching the filter
    const results = await Routeinfo.find(filter);

    // Respond with the results
    res.status(200).json(results);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: `Error: ${error.message}` });
  }
}
const ticketsearch = async (req, res) => {
  const { date, mobile } = req.body;

  try {
    // Validate input
    if (!date || !mobile) {
      return res
        .status(400)
        .json({ message: "Date and mobile number are required." });
    }

    // Check if the date is in the format YYYY/MM/DD

    // Parse the date string into a Date object
    const dateValue = new Date(date);

    // Check if the date conversion is valid
    if (isNaN(dateValue.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    // Define the start and end of the day
    const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));

    // Create a filter for the query
    const filter = {
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      mobile: mobile,
    };

    // Query the database
    const results = await bookedseat.find(filter);

    // Check if results are found
    if (results.length === 0) {
      return res
        .status(200)
        .json({ message: "No data found for the provided date and mobile." });
    }

    // Aggregate results by name (case insensitive) and mobile
    const aggregatedResults = {};

    results.forEach((curr) => {
      const normalizedName = curr._doc.name.toLowerCase(); // Normalize name to lowercase
      const key = `${normalizedName}-${curr._doc.mobile}`;
      if (!aggregatedResults[key]) {
        // Create a new entry for this key
        aggregatedResults[key] = {
          ...curr._doc, // Use _doc to access the actual document data
          seatNumber: curr._doc.seatNumber, // Initialize seatNumber with the first entry
        };
      } else {
        // Append seat number to existing entry
        aggregatedResults[key].seatNumber += `,${curr._doc.seatNumber}`;
      }
    });

    // Convert the aggregated results back to an array
    const responseData = Object.values(aggregatedResults);

    // Send the aggregated results back to the client
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error retrieving data:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

async function getsearchRouteBymobile(req, res) {
  try {
    const { date: dateStr, route } = req.query;

    if (!route) {
      return res.status(400).json({ error: "Route is required." });
    }

    if (dateStr) {
      // Reformat the date string from YYYY/MM/DD to YYYY-MM-DD
      const formattedDateStr = dateStr.replace(/\//g, "-"); // Replace all slashes with hyphens
      const dateValue = new Date(formattedDateStr);

      if (isNaN(dateValue)) {
        return res
          .status(400)
          .json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }

      // Create start of the day (midnight) and end of the day (just before the next midnight)
      const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));

      // Query for seats within the date range and specific route
      const seats = await SeatModel.find({
        route,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      // Group by mobile number and gather seat numbers in an array, along with other details
      const seatGroupByMobile = seats.reduce((acc, seat) => {
        if (!acc[seat.mobile]) {
          acc[seat.mobile] = {
            mobile: seat.mobile,
            seatNumbers: [],
            extradetails: seat.extradetails, // include any extra details from the seat
            name: seat.name, // include name or any other details
            date: seat.date,
            from: seat.from,
            to: seat.to,
            pickup: seat.pickup,
            drop: seat.drop,
            gender: seat.gender,
            price: seat.price,
            age: seat.age,
            extradetails: seat.extradetails,
          };
        }

        // Group seat numbers in an array
        acc[seat.mobile].seatNumbers.push(seat.seatNumber);

        return acc;
      }, {});

      // Convert the grouped object into an array for the response
      const response = Object.values(seatGroupByMobile);

      return res.status(200).json(response);
    } else {
      // If no date provided, find all seats for the given route
      const seats = await SeatModel.find({ route });

      // Group by mobile number and gather seat numbers in an array, along with other details
      const seatGroupByMobile = seats.reduce((acc, seat) => {
        if (!acc[seat.mobile]) {
          acc[seat.mobile] = {
            mobile: seat.mobile,
            seatNumbers: [],
            extradetails: seat.extradetails, // include any extra details from the seat
            name: seat.name, // include name or any other details
            date: seat.date,
            from: seat.from,
            to: seat.to,
            pickup: seat.pickup,
            drop: seat.drop,
            gender: seat.gender,
            price: seat.price,
            age: seat.age,
            extradetails: seat.extradetails,
          };
        }

        // Group seat numbers in an array
        acc[seat.mobile].seatNumbers.push(seat.seatNumber);

        return acc;
      }, {});

      // Convert the grouped object into an array for the response
      const response = Object.values(seatGroupByMobile);

      return res.status(200).json(response);
    }
  } catch (error) {
    console.error("Server error:", error); // Log the full error for debugging
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}

async function getchartprint(req, res) {
  try {
    const { date: dateStr, route } = req.query;

    if (!route) {
      return res.status(400).json({ error: "Route is required." });
    }

    if (dateStr) {
      // Reformat the date string from YYYY/MM/DD to YYYY-MM-DD
      const formattedDateStr = dateStr.replace(/\//g, "-"); // Replace all slashes with hyphens
      const dateValue = new Date(formattedDateStr);

      if (isNaN(dateValue)) {
        return res
          .status(400)
          .json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }

      // Create start of the day (midnight) and end of the day (just before the next midnight)
      const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));

      // Query for seats within the date range and specific route
      const seats = await SeatModel.find({
        route,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      // Group by pickuptime number and gather seat numbers in an array, along with other details
      const seatGroupBypickuptime = seats.reduce((acc, seat) => {
        if (!acc[seat.pickuptime]) {
          acc[seat.pickuptime] = {
            seatNumbers: [],
            pickup: seat.pickup,
          };
        }

        // Group seat numbers in an array
        acc[seat.pickuptime].seatNumbers.push(seat.seatNumber);

        return acc;
      }, {});

      // Convert the grouped object into an array
      let response = Object.values(seatGroupBypickuptime);

      // Sort the array by pickuptime in ascending order
      response = response.sort((a, b) => a.pickuptime - b.pickuptime);

      return res.status(200).json(response);
    } else {
      // If no date provided, find all seats for the given route
      const seats = await SeatModel.find({ route });

      // Group by pickuptime number and gather seat numbers in an array, along with other details
      const seatGroupBypickuptime = seats.reduce((acc, seat) => {
        if (!acc[seat.pickuptime]) {
          acc[seat.pickuptime] = {
            pickuptime: seat.pickuptime,
            seatNumbers: [],
            extradetails: seat.extradetails, // include any extra details from the seat
            name: seat.name, // include name or any other details
          };
        }

        // Group seat numbers in an array
        acc[seat.pickuptime].seatNumbers.push(seat.seatNumber);

        return acc;
      }, {});

      // Convert the grouped object into an array
      let response = Object.values(seatGroupBypickuptime);

      // Sort the array by pickuptime in ascending order
      response = response.sort((a, b) => a.pickuptime - b.pickuptime);

      return res.status(200).json(response);
    }
  } catch (error) {
    console.error("Server error:", error); // Log the full error for debugging
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}

module.exports = {
  getsearchAll,
  getsearchBus,
  getsearchAllByseat,
  getsearchRouteByvillage,
  getsearchRouteBymobile,
  ticketsearch,
  getchartprint,
};
