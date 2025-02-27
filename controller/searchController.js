const bookedseat = require("../models/bookedseat");
const SeatModel = require("../models/bookedseat");
const Businfo = require("../models/busInfo");
const Routeinfo = require("../models/routeinfo");
const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  if (!token) throw new Error("Authorization token is required.");
  return jwt.verify(token, process.env.JWT_SECRET);
};
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
          seatNumber: 1, // Include only the seatNumber field
          _id: 0, // Optionally exclude _id if not needed
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
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
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
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    return res.status(500).json({ error: error.message });
  }
}
async function getsearchAllByseat(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
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
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    return res.status(500).json({ error: error.message });
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

async function getSeatsByDate(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
    const { date, route } = req.query;

    // Check if date is provided
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Parse the date and set the time for start and end of the day
    const dateValue = new Date(date);
    const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0)); // Start of the day
    const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999)); // End of the day

    // Build the query filter object
    const seatQuery = { date: { $gte: startOfDay, $lte: endOfDay } };

    // If route is provided, add route filter to the seat query
    if (route) {
      seatQuery.route = route;
    }

    // Query the database for seats within the date range and optional route filter
    const seats = await SeatModel.find(seatQuery);

    // Query for routes that match the date range (and route if provided)
    const routeQuery = { date: { $gte: startOfDay, $lte: endOfDay } };
    if (route) {
      routeQuery._id = route;
    }

    const routes = await Routeinfo.find(routeQuery).select(
      "_id Busname date driver phonenumber price cabinprice location last"
    );

    // If no routes are found for the given date (and optionally route), return a message
    if (routes.length === 0) {
      return res
        .status(200)
        .json({ message: "No routes available for the given date" });
    }

    // Group seats by route and count occurrences
    const groupedSeats = seats.reduce((acc, seat) => {
      if (!acc[seat.route]) {
        acc[seat.route] = {
          passengers: [],
          cabinCount: 0, // Initialize cabin count for each route
          count: 0, // Initialize normal seat count for each route
        };
      }

      // Add passenger details to the grouped seats
      acc[seat.route].passengers.push({
        route: seat.route,
        date: seat.date,
        name: seat.name,
        mobile: seat.mobile,
        seatNumber: seat.seatNumber,
        extradetails: seat.extradetails,
        from: seat.from,
        to: seat.to,
        pickup: seat.pickup,
        drop: seat.drop,
        gender: seat.gender,
        pickuptime: seat.pickuptime,
        price: seat.price,
        age: seat.age,
        bookedBy: seat.bookedBy,
        id: seat._id,
        createdAt: seat.createdAt,
      });

      // Check if the seat is a "કેબિન-X" type
      const cabinPattern = /^કેબિન-\d+$/; // Regex to match "કેબિન-1", "કેબિન-2", etc.
      const regularSeatPattern = /^[A-L]$/; // Regex to match "A" to "L"
      const numberSeatPattern = /^[1-9]$|^[1][0-9]$|^2[0-4]$/; // Regex to match "1" to "24"
      const decimalSeatPattern = /^\d+\.\d+$/; // Regex to match "1.2", "2.5", etc.

      if (cabinPattern.test(seat.seatNumber)) {
        // If the seat is "કેબિન-X", increment the cabin count
        acc[seat.route].cabinCount += 1;
      } else if (decimalSeatPattern.test(seat.seatNumber)) {
        // If the seat has a decimal (like "1.2"), split and count as 2
        const parts = seat.seatNumber.split(".");
        acc[seat.route].count += parts.length; // Count parts (e.g., "1.2" is 2 parts)
      } else if (
        regularSeatPattern.test(seat.seatNumber) ||
        numberSeatPattern.test(seat.seatNumber)
      ) {
        // If the seat is from "A" to "L" or "1" to "24", increment the count
        acc[seat.route].count += 1;
      }

      return acc;
    }, {});

    // Prepare the response for all routes, including cabinCount and count
    const response = await Promise.all(
      routes.map(async (route) => {
        const passengers = groupedSeats[route._id]?.passengers || []; // If no passengers, return empty array
        const cabinCount = groupedSeats[route._id]?.cabinCount || 0; // Get the cabin count for this route
        const count = groupedSeats[route._id]?.count || 0; // Get the normal seat count for this route

        return {
          route: route._id,
          busName: route.Busname,
          last: route.last,
          date: route.date,
          price: route.price,
          cabinprice: route.cabinprice, // Ensure cabinprice is included here
          location: route.location,
          driver: route.driver,
          phonenumber: route.phonenumber,
          cabinCount: cabinCount, // Include the cabin seat count
          count: count, // Include the normal seat count
          passengers: passengers, // Include the passengers (empty or not)
        };
      })
    );

    // Send the response
    return res.status(200).json(response);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}

async function getchartprint(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
    const { route } = req.query;

    if (!route) {
      return res.status(400).json({ error: "Route is required." });
    }

    const seats = await SeatModel.find({ route });

    const seatGroupBypickuptime = seats.reduce((acc, seat) => {
      if (!acc[seat.pickuptime]) {
        acc[seat.pickuptime] = {
          pickuptime: seat.pickuptime,
          seatNumbers: [],
          pickup: seat.pickup,
        };
      }

      acc[seat.pickuptime].seatNumbers.push(seat.seatNumber);

      return acc;
    }, {});

    let response = Object.values(seatGroupBypickuptime);

    response.sort((a, b) => {
      const timeA = a.pickuptime ? parseTimeToMinutes(a.pickuptime) : Infinity;
      const timeB = b.pickuptime ? parseTimeToMinutes(b.pickuptime) : Infinity;
      return timeA - timeB;
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}

function parseTimeToMinutes(time) {
  if (typeof time !== "string" || !time.includes(":")) {
    return Infinity;
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return Infinity;
  }

  return hours * 60 + minutes;
}

async function getSeatsByMobile(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(400)
      .json({ error: "Token is required. Please provide a valid token." });
  }
  try {
    const decoded = verifyToken(token);

    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
    const { date } = req.query;

    // Check if date is provided
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Parse the date and set the time for start and end of day
    const dateValue = new Date(date.split("/").reverse().join("-")); // Convert DD/MM/YYYY to Date format
    const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0)); // Start of the day
    const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999)); // End of the day

    // Query the database for seats within the date range (start and end of day)
    // const seats = await SeatModel.aggregate([
    //   {
    //     $match: {
    //       date: { $gte: startOfDay, $lte: endOfDay }, // Date range query
    //     },
    //   },
    //   {
    //     $sort: { pickuptime: 1 },
    //   },
    //   {
    //     $group: {
    //       _id: { mobile: "$mobile", route: "$route" }, // Group by mobile number and route
    //       seatNumbersArray: { $push: "$seatNumber" }, // Collect all seat numbers for the group
    //       pickuptimeArray: { $push: "$pickuptime" }, // Collect all pickuptime for the group
    //       pickupArray: { $push: "$pickup" }, // Collect all pickup locations for the group
    //       from: { $first: "$from" }, // From location (since it’s the same for the same route)
    //       to: { $first: "$to" }, // To location (same as above)
    //     },
    //   },
    //   {
    //     $project: {
    //       mobile: "$_id.mobile",
    //       route: "$_id.route",
    //       seatNumbers: "$seatNumbersArray", // Array of seat numbers
    //       pickuptime: { $setUnion: ["$pickuptimeArray", []] }, // Remove duplicates from pickuptime
    //       pickup: { $setUnion: ["$pickupArray", []] }, // Remove duplicates from pickup
    //       from: 1,
    //       to: 1,
    //       // Calculate cabinCount using a regex to filter "કેબિન" entries
    //       cabinCount: {
    //         $size: {
    //           $filter: {
    //             input: "$seatNumbersArray",
    //             as: "seat",
    //             cond: { $regexMatch: { input: "$$seat", regex: /^કેબિન/ } },
    //           },
    //         },
    //       },
    //       // Calculate seatCount by counting each seat, excluding "કેબિન" seats
    //       seatCount: {
    //         $size: {
    //           $filter: {
    //             input: {
    //               $reduce: {
    //                 input: {
    //                   $map: {
    //                     input: "$seatNumbersArray",
    //                     as: "seat",
    //                     in: {
    //                       $cond: {
    //                         if: {
    //                           $regexMatch: { input: "$$seat", regex: /\./ }, // Check for a dot in the seat number
    //                         },
    //                         then: { $split: ["$$seat", "."] }, // Split "3.4" into ["3", "4"]
    //                         else: ["$$seat"], // Keep single seats as is
    //                       },
    //                     },
    //                   },
    //                 },
    //                 initialValue: [],
    //                 in: { $concatArrays: ["$$value", "$$this"] }, // Flatten the array
    //               },
    //             },
    //             as: "seat",
    //             cond: {
    //               $not: {
    //                 $regexMatch: { input: "$$seat", regex: /^કેબિન/ }, // Exclude "કેબિન" seats from the count
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // ]);
    const seats = await SeatModel.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay }, // Date range query
        },
      },
      {
        $sort: { pickuptime: 1 }, // Sort by pickuptime in ascending order
      },
      {
        $group: {
          _id: { mobile: "$mobile", route: "$route" }, // Group by mobile number and route
          seatNumbersArray: { $push: "$seatNumber" }, // Collect all seat numbers for the group
          pickuptimeArray: { $push: "$pickuptime" }, // Collect all pickuptime for the group
          pickupArray: { $push: "$pickup" }, // Collect all pickup locations for the group
          from: { $first: "$from" }, // From location (same for same route)
          to: { $first: "$to" }, // To location (same for same route)
        },
      },
      {
        $project: {
          mobile: "$_id.mobile",
          route: "$_id.route",
          seatNumbers: "$seatNumbersArray",
          // Remove duplicates from pickupArray using $reduce
          pickup: {
            $reduce: {
              input: "$pickupArray",
              initialValue: [],
              in: {
                $cond: {
                  if: { $in: ["$$this", "$$value"] },
                  then: "$$value",
                  else: { $concatArrays: ["$$value", ["$$this"]] },
                },
              },
            },
          },
          // Remove duplicates from pickuptimeArray using $reduce
          pickuptime: {
            $reduce: {
              input: "$pickuptimeArray",
              initialValue: [],
              in: {
                $cond: {
                  if: { $in: ["$$this", "$$value"] },
                  then: "$$value",
                  else: { $concatArrays: ["$$value", ["$$this"]] },
                },
              },
            },
          },
          from: 1,
          to: 1,
          // Calculate cabinCount using regex to filter "કેબિન" entries
          cabinCount: {
            $size: {
              $filter: {
                input: "$seatNumbersArray",
                as: "seat",
                cond: { $regexMatch: { input: "$$seat", regex: /^કેબિન/ } },
              },
            },
          },
          // Calculate seatCount by counting each seat, excluding "કેબિન" seats
          seatCount: {
            $size: {
              $filter: {
                input: {
                  $reduce: {
                    input: {
                      $map: {
                        input: "$seatNumbersArray",
                        as: "seat",
                        in: {
                          $cond: {
                            if: {
                              $regexMatch: { input: "$$seat", regex: /\./ }, // Check for a dot in the seat number
                            },
                            then: { $split: ["$$seat", "."] }, // Split "3.4" into ["3", "4"]
                            else: ["$$seat"], // Keep single seats as is
                          },
                        },
                      },
                    },
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] }, // Flatten the array
                  },
                },
                as: "seat",
                cond: {
                  $not: {
                    $regexMatch: { input: "$$seat", regex: /^કેબિન/ }, // Exclude "કેબિન" seats from the count
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          mobile: 1,
          route: 1,
          seatNumbers: 1,
          pickuptime: 1,
          pickup: 1,
          from: 1,
          to: 1,
          cabinCount: 1,
          seatCount: 1,
        },
      },
    ]);
    // If no seats are found, find the matching routes based on the date
    if (seats.length === 0) {
      // Query for routes that match the date range, but without filtering by route
      const routes = await Routeinfo.find({
        date: { $gte: startOfDay, $lte: endOfDay },
      }).select("_id from to pickup pickuptime");

      // If no routes are found for the given date, return empty response or message
      if (routes.length === 0) {
        return res
          .status(200)
          .json({ message: "No routes available for the given date" });
      }

      // Return the routes with empty passengers array
      const response = routes.map((route) => ({
        route: route._id,
        passengers: [], // Empty passengers array
        from: route.from,
        to: route.to,
        pickup: [route.pickup], // Return pickup as an array
        pickuptime: [route.pickuptime], // Return pickuptime as an array
      }));

      return res.status(200).json(response);
    }

    // Prepare response based on the grouped data
    const response = seats.map((group) => ({
      mobile: group.mobile,
      route: group.route,
      seatNumbers: group.seatNumbers, // Array of seat numbers
      pickuptime: group.pickuptime, // Array of pickup times without duplicates
      pickup: group.pickup, // Array of pickup locations without duplicates
      from: group.from, // From location
      to: group.to, // To location
      cabinCount: group.cabinCount, // Cabin count (for "કેબિન" seats)
      seatCount: group.seatCount, // Total seat count (split "3.4" to count 5 seats)
    }));

    // Send the response
    return res.status(200).json(response);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}

async function getLastBookedSeat(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "superAdmin") {
      return res.status(403).json({
        error: "Access denied. You are not authorized to view agents.",
      });
    }
    const { date } = req.query;

    // Check if date is provided
    if (!date) {
      // Fetch last 20 overall entries if no date is provided
      const seats = await SeatModel.find().sort({ createdAt: -1 }).limit(20);
      return res.status(200).json(seats);
    }

    // Parse the date and set the time for start and end of day
    const dateValue = new Date(date.split("/").reverse().join("-")); // Convert DD/MM/YYYY to Date format
    const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0)); // Start of the day
    const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999)); // End of the day

    // Fetch last 20 entries for the specific date range
    const seats = await SeatModel.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    // If no seats found for that day, fetch overall last 20 entries
    if (seats.length === 0) {
      const allSeats = await SeatModel.find().sort({ createdAt: -1 }).limit(20);
      return res.status(200).json(allSeats);
    }

    return res.status(200).json(seats);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please provide a valid token." });
    }
    return res.status(500).json({ error: "Server error" });
  }
}

async function getsearchRouteByvillage(req, res) {
  try {
    const { date, from, to } = req.query;
    console.log(from, to, date);
    // Initialize the filter object
    const filter = {};

    // Handle the 'date' filter: Check if a valid 'date' parameter is provided
    if (date) {
      const dateValue = new Date(date);
      if (!isNaN(dateValue.getTime())) {
        // Create separate Date objects for start and end of the day
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

    // Handle the 'from' filter: Check if it is provided and filter accordingly
    if (from) {
      filter["from.village"] = from;
    }

    // Handle the 'to' filter: Check if it is provided and filter accordingly
    if (to) {
      filter["to.village"] = to;
    }

    // Query the Routeinfo collection using the filter
    const results = await Routeinfo.find(filter);

    // If no results were found, send an empty array
    if (results.length === 0) {
      return res.status(200).json([]); // Explicitly returning an empty array
    }

    // Send back the results as a response
    res.status(200).json(results);
  } catch (error) {
    // Handle any errors that occur during the query process
    res.status(500).json({ error: `Error: ${error.message}` });
  }
}

module.exports = {
  getsearchAll,
  getsearchBus,
  getsearchAllByseat,
  getsearchRouteByvillage,
  getSeatsByDate,
  ticketsearch,
  getchartprint,
  getSeatsByMobile,
  getLastBookedSeat,
};
