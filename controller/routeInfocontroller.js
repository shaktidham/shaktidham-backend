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
const code=`${last}-${date}`;
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
        code,
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
    // Extract 'date' and 'id' from query parameters
    const { date, id } = req.query;

    // Case 1: If an 'id' is provided, search by '_id'
    if (id) {
      const busdetails = await Businfo.findById(id);

      if (!busdetails) {
        return res.status(404).json({ error: "Bus details not found for the given id." });
      }

      // Return the bus details by _id
      return res.status(200).json({ data: busdetails });
    }

    // Case 2: If a 'date' is provided, search by date range
    if (date) {
      // Parse the date string into a Date object
      const dateValue = new Date(date);

      // Check if the date conversion is valid
      if (!isNaN(dateValue.getTime())) {
        // Create a copy of the date for startOfDay and endOfDay
        const startOfDay = new Date(dateValue.getTime());
        startOfDay.setHours(0, 0, 0, 0); // set to start of the day

        const endOfDay = new Date(dateValue.getTime());
        endOfDay.setHours(23, 59, 59, 999); // set to end of the day

        // Create a filter to match documents where the date is within the specified date range
        const filter = {
          date: { $gte: startOfDay, $lte: endOfDay },
        };

        // Find bus details for the specified date using the constructed filter
        const busdetails = await Businfo.find(filter);

        // Return the bus details
        return res.status(200).json({ data: busdetails });
      } else {
        return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }
    }

    // If neither 'date' nor 'id' is provided
    return res.status(400).json({ error: "Either 'date' or 'id' parameter is required." });

  } catch (error) {
    res.status(500).json({ message: `Error while fetching details: ${error.message}` });
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
    if (!date) {
      return res.status(400).json({ message: "All required fields must be provided" });
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

    // Get the codes from query or use id if codes are not provided
    const codes = req.query.codes ? req.query.codes.split(',') : [];
    const id = req.query.id;

    if (codes.length === 0 && !id) {
      return res.status(400).json({ message: "Bus codes or id are required" });
    }

    // Define the filter for the update operation
    let filter = {};
    if (codes.length > 0) {
      filter.code = { $in: codes };
    } else if (id) {
      filter._id = id;  // If id is provided, search by _id
    }

    // Find and update bus details by code or id
    const busDetails = await Businfo.updateMany(
      filter,  // The dynamic filter based on provided codes or id
      {
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
        cabinprice,
      },
      { new: true } // Option to return the updated document
    );

    // If no buses were updated
    if (busDetails.nModified === 0) {
      return res.status(404).json({ message: "No bus details found for the provided codes or id" });
    }

    // Send the updated bus details back to the client
    res.status(200).json({ message: "Bus details updated successfully", data: busDetails });
  } catch (error) {
    // Catch any other errors and send a generic error message
    res.status(500).json({ message: `Error while updating bus details: ${error.message}` });
  }
}

async function routereadid(req, res) {
  try {
    // Extract 'date' and 'id' from query parameters
    const { date, id } = req.query;

    // Case 1: If an 'id' is provided, search by '_id'
    if (id) {
      const busdetails = await Businfo.findById(id);

      if (!busdetails) {
        return res.status(404).json({ error: "Bus details not found for the given id." });
      }

      // Return the bus details by _id
      return res.status(200).json({ data: busdetails });
    }

    // Case 2: If a 'date' is provided, search by date range
    if (date) {
      // Parse the date string into a Date object
      const dateValue = new Date(date);

      // Check if the date conversion is valid
      if (!isNaN(dateValue.getTime())) {
        // Create a copy of the date for startOfDay and endOfDay
        const startOfDay = new Date(dateValue.getTime());
        startOfDay.setHours(0, 0, 0, 0); // set to start of the day

        const endOfDay = new Date(dateValue.getTime());
        endOfDay.setHours(23, 59, 59, 999); // set to end of the day

        // Create a filter to match documents where the date is within the specified date range
        const filter = {
          date: { $gte: startOfDay, $lte: endOfDay },
        };

        // Find bus details for the specified date using the constructed filter
        const busdetails = await Businfo.find(filter,'_id Busname');

        // Return the bus details
        return res.status(200).json({ data: busdetails });
      } else {
        return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD." });
      }
    }

    // If neither 'date' nor 'id' is provided
    return res.status(400).json({ error: "Either 'date' or 'id' parameter is required." });

  } catch (error) {
    res.status(500).json({ message: `Error while fetching details: ${error.message}` });
  }
}



module.exports = { routeDetails, routeupdate, routeread, routedelete,routereadid };
