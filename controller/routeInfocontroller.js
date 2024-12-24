const Businfo = require("../models/routeinfo");
const villageadd = require("../models/villageadd");

async function routeDetails(req, res) {
  try {
    const {
      date,
      fromtime,
      droptime,
      to,
      from, // This is the array of villages in the request body
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

    // Fetch all village data from the database at once
    const villageNames = [...from, ...to].map((item) => item.village);
    const villageRecords = await villageadd
      .find({ village: { $in: villageNames } })
      .lean();

    // Create a lookup map from the database records
    const villageMap = villageRecords.reduce((acc, { village, evillage }) => {
      acc[village] = evillage;
      return acc;
    }, {});

    // Helper function to map villages and update the array
    const mapVillages = (array) => {
      return array.map(({ village, point }) => ({
        village,
        evillage: villageMap[village] || null,
        point,
      }));
    };

    // Update 'from' and 'to' arrays with mapped village data
    const updatedFrom = mapVillages(from);
    const updatedTo = mapVillages(to);

    // Create bus details for each day in the given date range
    const busDetails = [];
    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const busDetail = await Businfo.create({
        date: new Date(currentDate), // Set the current date in the loop
        fromtime,
        droptime,
        Busname,
        from: updatedFrom,
        to: updatedTo,
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
      droptime,
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

    // Validate required fields
    if (
      !date ||
      !fromtime ||
      !droptime ||
      !from ||
      !to ||
      !Busname ||
      !price ||
      !first ||
      !last ||
      !location ||
      !driver ||
      !cabinprice
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Fetch village data for 'from' and 'to' arrays (combine both arrays for one query)
    const villageNames = [...from, ...to].map((item) => item.village);
    const villageRecords = await villageadd
      .find({ village: { $in: villageNames } })
      .lean();

    // Create a lookup map for villages to their evillage
    const villageMap = villageRecords.reduce((acc, { village, evillage }) => {
      acc[village] = evillage;
      return acc;
    }, {});

    // Helper function to update villages in 'from' and 'to' arrays
    const updateVillages = (array) => {
      return array.map(({ village, point }) => ({
        village,
        evillage: villageMap[village] || null, // Automatically update evillage
        point,
      }));
    };

    // Update 'from' and 'to' arrays with their evillages
    const updatedFrom = updateVillages(from);
    const updatedTo = updateVillages(to);

    // Find the bus info by ID and update the document
    const busDetails = await Businfo.findByIdAndUpdate(
      req.params.id, // Find the bus details using the ID passed in the URL parameters
      {
        fromtime,
        droptime,
        date,
        from: updatedFrom,
        to: updatedTo,
        Busname,
        price,
        first,
        last,
        location,
        driver,
        cabinprice,
      },
      { new: true } // This option returns the updated document
    );

    // If no document is found with the given ID
    if (!busDetails) {
      return res.status(404).json({ message: "Bus details not found" });
    }

    // Send the updated bus details back to the client
    res.status(200).json({ data: busDetails });
  } catch (error) {
    // Catch any other errors and send a generic error message
    console.error("Error while updating bus details: ", error);
    res
      .status(500)
      .json({ message: `Error while updating bus details: ${error.message}` });
  }
}

module.exports = { routeDetails, routeupdate, routeread, routedelete };
