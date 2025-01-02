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

async function getSeatsByDate(req, res) {
  try {
    const { date } = req.query;

    // Check if date is provided
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Parse the date and set the time for start and end of the day
    const dateValue = new Date(date);
    const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0)); // Start of the day
    const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999)); // End of the day

    // Query the database for seats within the date range (start and end of day)
    const seats = await SeatModel.find({
      date: { $gte: startOfDay, $lte: endOfDay }, // Date range query
    });

    // Query for routes that match the date range
    const routes = await Routeinfo.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).select("_id Busname date driver price cabinprice location last");

    // If no routes are found for the given date, return a message
    if (routes.length === 0) {
      return res.status(200).json({ message: "No routes available for the given date" });
    }

    // Group seats by route
    const groupedSeats = seats.reduce((acc, seat) => {
      if (!acc[seat.route]) {
        acc[seat.route] = []; // Initialize array for each route
      }

      // Push the passenger details for each route
      acc[seat.route].push({
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
        id: seat._id,
      });

      return acc;
    }, {});

    // Prepare the response for all routes, including cabinprice
    const response = await Promise.all(routes.map(async (route) => {
      const passengers = groupedSeats[route._id] || []; // If no passengers, return empty array

      return {
        route: route._id,
        busName: route.Busname,
        last:route.last,
        date: route.date,
        price: route.price,
        cabinprice: route.cabinprice, // Ensure cabinprice is included here
        location: route.location,
        driver: route.driver,
        passengers: passengers, // Include the passengers (empty or not)
      };
    }));

    // Send the response
    return res.status(200).json(response);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}



async function getchartprint(req, res) {
  try {
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
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}

function parseTimeToMinutes(time) {
  if (typeof time !== "string" || !time.includes(":")) {
    return Infinity;
  }

  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return Infinity;
  }

  return hours * 60 + minutes;
}

// async function getSeatsByMobile(req, res) {
//   try {
//     const { date } = req.query;

//     // Check if date is provided
//     if (!date) {
//       return res.status(400).json({ error: "Date parameter is required" });
//     }

//     // Parse the date and set the time for start and end of the day
//     const dateValue = new Date(date.split('/').reverse().join('-')); // Convert DD/MM/YYYY to Date format
//     const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0)); // Start of the day
//     const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999)); // End of the day

//     // Query the database for seats within the date range (start and end of day)
//     const seats = await SeatModel.find({
//       date: { $gte: startOfDay, $lte: endOfDay }, // Date range query
//     });

//     // If no seats are found, find the matching routes based on the date
//     if (seats.length === 0) {
//       // Query for routes that match the date range, but without filtering by route
//       const routes = await Routeinfo.find({
//         date: { $gte: startOfDay, $lte: endOfDay },
//       }).select("_id from to pickup pickuptime");

//       // If no routes are found for the given date, return empty response or message
//       if (routes.length === 0) {
//         return res.status(200).json({ message: "No routes available for the given date" });
//       }

//       // Return the routes with empty passengers array
//       const response = routes.map(route => ({
//         route: route._id,
//         passengers: [], // Empty passengers array
//         from: route.from,
//         to: route.to,
//         pickup: route.pickup,
//         pickuptime: route.pickuptime,
//       }));

//       return res.status(200).json(response);
//     }

//     // Group seats by mobile number and route, then collect seat numbers
//     const groupedSeats = seats.reduce((acc, seat) => {
//       const key = `${seat.mobile}-${seat.route}`; // Group by mobile number, from, and to (route info)

//       if (!acc[key]) {
//         acc[key] = {
//           mobile: seat.mobile,
//           route: `${seat.route}`,
//           seatNumbers: [],
//           pickuptime: seat.pickuptime, // Assuming `pickuptime` is available in SeatModel
//           pickup: seat.pickup, // Assuming `pickup` is available in SeatModel
//           from: seat.from,
//           to: seat.to,
//         }; // Initialize group
//       }

//       // Push the seat number into the array for this group
//       acc[key].seatNumbers.push(seat.seatNumber);

//       return acc;
//     }, {});

//     // Prepare response based on the grouped data
//     const response = Object.values(groupedSeats).map(group => ({
//       mobile: group.mobile,
//       route: group.route,
//       seatNumbers: group.seatNumbers, // Array of seat numbers
//       pickuptime: group.pickuptime,   // Pickup time
//       pickup: group.pickup,           // Pickup location
//       from: group.from,               // From location (assuming available from Routeinfo)
//       to: group.to,                   // To location (assuming available from Routeinfo)
//     }));

//     // Send the response
//     return res.status(200).json(response);
//   } catch (error) {
//     console.error("Server error:", error);
//     return res.status(500).json({ error: "Server error: " + error.message });
//   }
// }



// async function getSeatsByMobile(req, res) {  
//   try {    
//     const { date } = req.query;      

//     // Check if date is provided    
//     if (!date) {      
//       return res.status(400).json({ error: "Date parameter is required" });    
//     }      

//     // Parse the date and set the time for start and end of day    
//     const dateValue = new Date(date.split('/').reverse().join('-')); // Convert DD/MM/YYYY to Date format    
//     const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0)); // Start of the day    
//     const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999)); // End of the day      

//     // Query the database for seats within the date range (start and end of day)    
//     const seats = await SeatModel.aggregate([      
//       {        
//         $match: {          
//           date: { $gte: startOfDay, $lte: endOfDay }, // Date range query        
//         },      
//       },      
//       {        
//         $group: {          
//           _id: { mobile: "$mobile", route: "$route" }, // Group by mobile number and route          
//           seatNumbersArray: { $push: "$seatNumber" }, // Collect all seat numbers for the group          
//           pickuptime: { $first: "$pickuptime" }, // Assuming pickuptime is in SeatModel          
//           pickup: { $first: "$pickup" }, // Pickup location          
//           from: { $first: "$from" }, // From location          
//           to: { $first: "$to" }, // To location        
//         },      
//       },      
//       {        
//         $project: {          
//           mobile: "$_id.mobile",          
//           route: "$_id.route",          
//           seatNumbersArray: 1,          
//           pickuptime: 1,          
//           pickup: 1,              
//           from: 1,              
//           to: 1,                  
//           // Calculate cabinCount using a regex to filter "કેબિન" entries          
//           cabinCount: {            
//             $size: {              
//               $filter: {                
//                 input: "$seatNumbersArray",                
//                 as: "seat",                
//                 cond: { $regexMatch: { input: "$$seat", regex: /^કેબિન/ } },              
//               },            
//             },          
//           },          
//           // Calculate seatCount by counting each seat, excluding "કેબિન" seats          
//           seatCount: {
//             $size: {
//               $filter: {
//                 input: {
//                   $reduce: {
//                     input: {
//                       $map: {
//                         input: "$seatNumbersArray",
//                         as: "seat",
//                         in: {
//                           $cond: {
//                             if: {
//                               $regexMatch: { input: "$$seat", regex: /\./ }, // Check for a dot in the seat number
//                             },
//                             then: { $split: ["$$seat", "."] }, // Split "3.4" into ["3", "4"]
//                             else: ["$$seat"], // Keep single seats as is
//                           },
//                         },
//                       },
//                     },
//                     initialValue: [],
//                     in: { $concatArrays: ["$$value", "$$this"] }, // Flatten the array
//                   },
//                 },
//                 as: "seat",
//                 cond: {
//                   $not: {
//                     $regexMatch: { input: "$$seat", regex: /^કેબિન/ }, // Exclude "કેબિન" seats from the count
//                   },
//                 },
//               },
//             },
//           },        
//         },      
//       },    
//     ]);      

//     // If no seats are found, find the matching routes based on the date    
//     if (seats.length === 0) {      
//       // Query for routes that match the date range, but without filtering by route      
//       const routes = await Routeinfo.find({        
//         date: { $gte: startOfDay, $lte: endOfDay },      
//       }).select("_id from to pickup pickuptime");        

//       // If no routes are found for the given date, return empty response or message      
//       if (routes.length === 0) {        
//         return res.status(200).json({ message: "No routes available for the given date" });      
//       }        

//       // Return the routes with empty passengers array      
//       const response = routes.map(route => ({        
//         route: route._id,        
//         passengers: [], // Empty passengers array        
//         from: route.from,        
//         to: route.to,        
//         pickup: route.pickup,        
//         pickuptime: route.pickuptime,      
//       }));        

//       return res.status(200).json(response);    
//     }      

//     // Prepare response based on the grouped data    
//     const response = seats.map(group => ({      
//       mobile: group.mobile,      
//       route: group.route,      
//       seatNumbers: group.seatNumbersArray, // Array of seat numbers      
//       pickuptime: group.pickuptime,   // Pickup time      
//       pickup: group.pickup,           // Pickup location      
//       from: group.from,               // From location      
//       to: group.to,                   // To location      
//       cabinCount: group.cabinCount,   // Cabin count (for "કેબિન" seats)      
//       seatCount: group.seatCount,     // Total seat count (split "3.4" to count 5 seats)    
//     }));      

//     // Send the response    
//     return res.status(200).json(response);  
//   } catch (error) {    
//     console.error("Server error:", error);    
//     return res.status(500).json({ error: "Server error: " + error.message });  
//   } 
// }


async function getSeatsByMobile(req, res) {
  try {
    const { date } = req.query;

    // Check if date is provided
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Parse the date and set the time for start and end of day
    const dateValue = new Date(date.split('/').reverse().join('-')); // Convert DD/MM/YYYY to Date format
    const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0)); // Start of the day
    const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999)); // End of the day

    // Query the database for seats within the date range (start and end of day)
    const seats = await SeatModel.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay }, // Date range query
        },
      },
      {
        $group: {
          _id: { mobile: "$mobile", route: "$route" }, // Group by mobile number and route
          seatNumbersArray: { $push: "$seatNumber" }, // Collect all seat numbers for the group
          pickuptimeArray: { $push: "$pickuptime" }, // Collect all pickuptime for the group
          pickupArray: { $push: "$pickup" }, // Collect all pickup locations for the group
          from: { $first: "$from" }, // From location (since it’s the same for the same route)
          to: { $first: "$to" }, // To location (same as above)
        },
      },
      {
        $project: {
          mobile: "$_id.mobile",
          route: "$_id.route",
          seatNumbers: "$seatNumbersArray", // Array of seat numbers
          pickuptime: "$pickuptimeArray", // Array of pickuptime
          pickup: "$pickupArray", // Array of pickup locations
          from: 1,
          to: 1,
          // Calculate cabinCount using a regex to filter "કેબિન" entries
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
    ]);

    // If no seats are found, find the matching routes based on the date
    if (seats.length === 0) {
      // Query for routes that match the date range, but without filtering by route
      const routes = await Routeinfo.find({
        date: { $gte: startOfDay, $lte: endOfDay },
      }).select("_id from to pickup pickuptime");

      // If no routes are found for the given date, return empty response or message
      if (routes.length === 0) {
        return res.status(200).json({ message: "No routes available for the given date" });
      }

      // Return the routes with empty passengers array
      const response = routes.map(route => ({
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
    const response = seats.map(group => ({
      mobile: group.mobile,
      route: group.route,
      seatNumbers: group.seatNumbers, // Array of seat numbers
      pickuptime: group.pickuptime, // Array of pickup times
      pickup: group.pickup, // Array of pickup locations
      from: group.from, // From location
      to: group.to, // To location
      cabinCount: group.cabinCount, // Cabin count (for "કેબિન" seats)
      seatCount: group.seatCount, // Total seat count (split "3.4" to count 5 seats)
    }));

    // Send the response
    return res.status(200).json(response);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error: " + error.message });
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
  getSeatsByMobile
};
