const SeatModel = require("../models/bookedseat");
const routeInfo = require("../models/routeinfo");
const { translate } = require("@vitalets/google-translate-api");

// async function allocateSeats(req, res) {
//   try {
//     const { seatNumber, name, from,to,pickup,drop,gender,age, mobile, date } = req.body; // Notice the change here
//     const existingRoute = await routeInfo.findById(req.params.id);

//     if (!existingRoute) {
//       return res.status(404).json({ message: 'Route not found' });
//     }

//     // If seatNumber is a string, split it into an array (assuming format "A,B,1,2")
//     const seatArray = Array.isArray(seatNumber) ? seatNumber : seatNumber.split(',');

//     const allocatedSeats = [];
//     for (const seatNumber of seatArray) {
//       // Create a seat for each seat number
//       const currentSeat = await SeatModel.create({
//         name: name,
//         from:from,
//         to:to,
//         pickup:pickup,
//         drop:drop,
//         age:age,
//         gender:gender,
//         mobile: mobile,
//         date: date,
//         seatNumber: seatNumber.trim(), // Trim any extra whitespace
//         route: existingRoute._id
//       });
//       allocatedSeats.push(currentSeat);
//     }

//     res.status(201).json({ data: allocatedSeats });
//   } catch (error) {
//     res.status(500).json({ message: `Error while allocating seats: ${error.message}` });
//   }
// }
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
      totime,
      pickuptime,
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
        pickuptime: pickuptime,
        totime: totime,
        price: price,
        drop: drop,
        age: age,
        gender: gender,
        mobile: mobile,
        extradetails: extradetails,
        date: date,
        seatNumber: seatNumber.trim(), // Trim any extra whitespace for consistency
        route: existingRoute._id, // Associate with the existing route
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
async function updateseat(req, res) {
  try {
    const {
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
    } = req.body;

    const currentSeat = await SeatModel.findByIdAndUpdate(req.params.id, {
      name: name,
      mobile: mobile,
      from: from,
      to: to,
      pickup: pickup,
      price: price,
      drop: drop,
      age: age,
      gender: gender,
      extradetails: extradetails,
    });
    res.status(201).json({ data: currentSeat });
  } catch (error) {
    res.status(500).json(`error while allocating seat ${error}`);
  }
}

module.exports = { allocateSeats, allseats, updateseat, deleteseat };
