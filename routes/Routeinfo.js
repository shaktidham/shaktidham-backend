const express = require("express");
const {
  routeDetails,
  routeupdate,
  routeread,
  routedelete,
} = require("../controller/routeInfocontroller");
const { getsearchRouteByvillage } = require("../controller/searchController");
const { getsearchBus } = require("../controller/searchController");
// const { allocateSeats } = require('../controller/seatController');
// const {  } = require('../controllers/');

const router = express.Router();

router.post("/create", routeDetails);
router.put("/update", routeupdate);
router.get("/read", routeread);
router.delete("/delete/:id", routedelete);
router.get("/searchbyvillage", getsearchRouteByvillage);
router.get("/searchBus", getsearchBus);

module.exports = router;
