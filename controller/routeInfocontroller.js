const Businfo = require("../models/routeinfo");

async function routeDetails(req, res) {
  try {
    const {
      date,
      fromtime,
      totime,
      to,
      from,
      price,
      first,
      last,
      Busname,
      location,
      driver,
      cabinprice,
      enddate,
    } = req.body;

    // Convert the date strings to Date objects
    const startDate = new Date(date); // Start date
    const endDate = new Date(enddate); // End date

    // Check if the startDate is less than the endDate
    if (startDate > endDate) {
      return res
        .status(400)
        .json("Start date cannot be later than the end date");
    }

    const busDetails = [];
    // const pointDeta
    // for(let i of to){

    // }

    // Loop through each day between startDate and endDate
    for (
      let currentDate = startDate;
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const busDetail = await Businfo.create({
        date: new Date(currentDate), // Set the current date in the loop
        fromtime,
        totime,
        Busname,
        from,
        to,
        price,
        first,
        last,
        location,
        driver,
        cabinprice,
      });

      busDetails.push(busDetail); // Add the created bus detail to the array
    }

    res.status(200).json({ data: busDetails });
  } catch (error) {
    res.status(500).json(`Error while fetching details: ${error}`);
  }
}

async function routedelete(req, res) {
  try {
    // const { route } = req.body;

    const busdetails = await Businfo.findByIdAndDelete(req.params.id);
    res.status(200).json("route is deleted");
  } catch (error) {
    res.status(500).json(`error while fetching details ${error}`);
  }
}
async function routeread(req, res) {
  try {
    // Extract 'date' from query parameters
    const { date } = req.query;
    console.log(date, req.query, "date");

    // Check if date is provided
    if (date) {
      // Parse the date string into a Date object
      const dateValue = new Date(date);

      // Check if the date conversion is valid
      if (!isNaN(dateValue.getTime())) {
        // Create a copy of the date for startOfDay and endOfDay
        const startOfDay = new Date(dateValue.getTime()); // copy the date
        startOfDay.setHours(0, 0, 0, 0); // set to start of the day

        const endOfDay = new Date(dateValue.getTime()); // copy the date
        endOfDay.setHours(23, 59, 59, 999); // set to end of the day

        // Create a filter to match documents where the date is within the specified date range
        const filter = {
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        };

        // Find bus details for the specified date using the constructed filter
        const busdetails = await Businfo.find(filter);

        // Return the bus details
        res.status(200).json({ data: busdetails });
      } else {
        return res
          .status(400)
          .json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }
    } else {
      return res.status(400).json({ error: "Date parameter is required." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error while fetching details: ${error.message}` });
  }
}

async function routeupdate(req, res) {
  try {
    const {
      date,
      fromtime,
      totime,
      to,
      from,
      price,
      first,
      last,
      Busname,
      location,
      driver,
      cabinprice,
    } = req.body;

    const busdetails3 = await Businfo.findByIdAndUpdate(
      req.params.id,
      {
        fromtime,
        totime,
        date,
        from,
        to,
        Busname,
        price,
        first,
        last,
        location,
        driver,
        cabinprice,
      },
      { new: true }
    );
    res.status(200).json({ data: busdetails3 });
  } catch (error) {
    res.status(500).json(`error while fetching details ${error}`);
  }
}

module.exports = { routeDetails, routeupdate, routeread, routedelete };
