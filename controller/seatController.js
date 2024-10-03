const SeatModel = require("../models/bookedseat");
const routeInfo = require("../models/routeinfo");
const { translate } = require("@vitalets/google-translate-api");

// async function allocateSeats(req, res) {
//   try {
//     const { seatNumbers, name, from,to,pickup,drop,gender,age, mobile, date } = req.body; // Notice the change here
//     const existingRoute = await routeInfo.findById(req.params.id);

//     if (!existingRoute) {
//       return res.status(404).json({ message: 'Route not found' });
//     }

//     // If seatNumbers is a string, split it into an array (assuming format "A,B,1,2")
//     const seatArray = Array.isArray(seatNumbers) ? seatNumbers : seatNumbers.split(',');

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
      seatNumbers,
      name,
      from,
      to,
      pickup,
      drop,
      gender,
      age,
      mobile,
      date,
    } = req.body;
    const existingRoute = await routeInfo.findById(req.params.id);

    if (!existingRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Split seatNumbers into an array
    const seatArray = Array.isArray(seatNumbers)
      ? seatNumbers
      : seatNumbers.split(",");

    // Check for existing seat allocations on the same date and route
    const existingAllocations = await SeatModel.find({
      route: existingRoute._id,
      date: date,
      seatNumber: { $in: seatArray.map((seat) => seat.trim()) }, // Trim and match
    });

    if (existingAllocations.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Some or all of the requested seats are already allocated for the selected date.",
        });
    }

    const allocatedSeats = [];
    for (const seatNumber of seatArray) {
      const currentSeat = await SeatModel.create({
        name: name,
        from: from,
        to: to,
        pickup: pickup,
        drop: drop,
        age: age,
        gender: gender,
        mobile: mobile,
        date: date,
        seatNumber: seatNumber.trim(), // Trim any extra whitespace
        route: existingRoute._id,
      });
      allocatedSeats.push(currentSeat);
    }

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
    const { name, vilage, mobile } = req.body;

    const currentSeat = await SeatModel.findByIdAndUpdate(req.params.id, {
      name: name,
      vilage: vilage,
      mobile: mobile,
    });
    res.status(201).json({ data: currentSeat });
  } catch (error) {
    res.status(500).json(`error while allocating seat ${error}`);
  }
}

module.exports = { allocateSeats, allseats, updateseat, deleteseat };
