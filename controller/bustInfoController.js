const Businfo = require("../models/busInfo");
const routeInfo = require("../models/routeinfo");

async function busDetails(req, res) {
  try {
    const { date, location, busNumber, price } = req.body;
    const exsitRoute = await routeInfo.findById(req.params.id);
    if (!exsitRoute) {
      res.status(404).json(`Route not found`);
    }

    const busdetails = await Businfo.create({
      date,
      location,
      busNumber,
      price,
      route: exsitRoute._id,
    });
    res.status(200).json({ data: busdetails });
  } catch (error) {
    res.status(500).json(`error while fetching details ${error}`);
  }
}
async function busDetailsupdate(req, res) {
  try {
    const { date, location, busNumber, price } = req.body;
    const exsitRoute = await routeInfo.findById(req.params.id);
    if (!exsitRoute) {
      res.status(404).json(`Route not found`);
    }

    const busdetails = await Businfo.findByIdAndUpdate(req.params.id, {
      date,
      location,
      busNumber,
      price,
      route: exsitRoute._id,
    });
    res.status(200).json({ data: busdetails });
  } catch (error) {
    res.status(500).json(`error while fetching details ${error}`);
  }
}

module.exports = { busDetails, busDetailsupdate };
