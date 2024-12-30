const SeatModel = require("../models/bookedseat");
const routeInfo = require("../models/routeinfo");
const { translate } = require("@vitalets/google-translate-api");


async function allocateSeats(req, res) {
  try {
    const {
      seatNumber,
      name,
      from,
      to,
      pickup,
      drop,
      gender,
      age,
      mobile,
      price,
      date,
      extradetails,
    } = req.body;

    // Check if seatNumber is provided and is a valid string or array
    if (
      !seatNumber ||
      (typeof seatNumber !== "string" && !Array.isArray(seatNumber))
    ) {
      return res.status(400).json({
        message:
          "seatNumber must be provided and be either a string or an array.",
      });
    }

    // If seatNumber is a string, split it into an array
    const seatArray = Array.isArray(seatNumber)
      ? seatNumber
      : seatNumber.split(",");

    const existingRoute = await routeInfo.findById(req.params.id);

    if (!existingRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Function to find time based on pointName in 'from' or 'to' arrays
    function findTimeForPoint(pointName, direction) {
      // Iterate through 'from' or 'to' to find matching pointName
      const pointsArray = existingRoute[direction];
      for (let village of pointsArray) {
        for (let point of village.point) {
          if (point.pointName === pointName) {
            return point.time; // Return the time when pointName matches
          }
        }
      }
      return null; // Return null if no matching pointName found
    }

    // Find pickupTime and dropTime based on provided point names
    const pickupTime = findTimeForPoint(pickup, "from"); // Get time for pickup from 'from' array
    const dropTime = findTimeForPoint(drop, "to"); // Get time for drop from 'to' array

    // if (!pickupTime) {
    //   return res.status(400).json({ message: "Pickup point not found" });
    // }
    // if (!dropTime) {
    //   return res.status(400).json({ message: "Drop point not found" });
    // }

    // Check for existing seat allocations on the same date and route
    const existingAllocations = await SeatModel.find({
      route: existingRoute._id,
      date: date,
      seatNumber: { $in: seatArray?.map((seat) => seat.trim()) }, // Trim and match
    });

    if (existingAllocations.length > 0) {
      return res.status(400).json({
        message:
          "Some or all of the requested seats are already allocated for the selected date.",
      });
    }

    // Allocate seats
    const allocatedSeats = [];
    for (const seatNumber of seatArray) {
      // Here, seatNumber corresponds to each individual seat from seatNumber array
      const currentSeat = await SeatModel.create({
        name: name,
        from: from,
        to: to,
        pickup: pickup,
        price: price,
        drop: drop,
        age: age,
        gender: gender,
        mobile: mobile,
        extradetails: extradetails,
        date: date,
        seatNumber: seatNumber.trim(), // Trim any extra whitespace for consistency
        route: existingRoute._id, // Associate with the existing route
        pickuptime: pickupTime, // Save pickup time
        droptime: dropTime, // Save drop time
      });
      allocatedSeats.push(currentSeat);
    }

    // Return the allocated seat data
    res.status(201).json({ data: allocatedSeats });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error while allocating seats: ${error.message}` });
  }
}


async function allseats(req, res) {
  try {
    const currentSeat = await SeatModel.find({});
    res.status(201).json({ data: currentSeat });
  } catch (error) {
    res.status(500).json(`error while allocating seat ${error}`);
  }
}
async function deleteseat(req, res) {
  try {
    const currentSeat = await SeatModel.findByIdAndDelete(req.params.id);
    res.status(201).json("seat is deleted");
  } catch (error) {
    res.status(500).json(`error while allocating seat ${error}`);
  }
}
// async function updateseat(req, res) {
//   try {
//     const {
//       name,
//       mobile,
//       from,
//       to,
//       pickup,
//       price,
//       drop,
//       age,
//       gender,
//       extradetails,
//     } = req.body;

//     const currentSeat = await SeatModel.findByIdAndUpdate(req.params.id, {
//       name: name,
//       mobile: mobile,
//       from: from,
//       to: to,
//       pickup: pickup,
//       price: price,
//       drop: drop,
//       age: age,
//       gender: gender,
//       extradetails: extradetails,
//     });
//     res.status(201).json({ data: currentSeat });
//   } catch (error) {
//     res.status(500).json(`error while allocating seat ${error}`);
//   }
// }
async function updateseat(req, res) {
  try {
    const {
      name,
      mobile,
      from,
      to,
      pickup,
      drop,
      price,
      age,
      gender,
      extradetails,
    } = req.body;
    const route = req.query.id;
    const id =req.params.id  

    // Fetch the existing route using the route ID from the request
    const existingRoute = await routeInfo.findById(route);
    if (!existingRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Function to find time based on pointName in 'from' or 'to' arrays
    function findTimeForPoint(pointName, direction) {
      const pointsArray = existingRoute[direction];
      for (let village of pointsArray) {
        for (let point of village.point) {
          if (point.pointName === pointName) {
            return point.time; // Return the time when pointName matches
          }
        }
      }
      return null; // Return null if no matching pointName found
    }

    // Find pickupTime and dropTime based on provided point names
    const pickupTime = findTimeForPoint(pickup, "from"); // Get time for pickup from 'from' array
    // const dropTime = findTimeForPoint(drop, "to"); // Get time for drop from 'to' array



    // Find the current seat by ID
    const currentSeat = await SeatModel.findByIdAndUpdate (id, {
      name,
      mobile,
      from,
      to,
      pickup,
      price,
      drop,
      age,
      gender,
      extradetails,
      pickuptime: pickupTime, // Update pickup time
         // Update drop time
    });

    if (!currentSeat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    // Return the updated seat details
    res.status(200).json({ data: currentSeat });
  } catch (error) {
    res.status(500).json({ message: `Error while updating seat: ${error.message}` });
  }
}



module.exports = { allocateSeats, allseats, updateseat, deleteseat };
