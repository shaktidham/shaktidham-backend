const express = require("express");
const {
  busDetails,
  busDetailsupdate,
} = require("../controller/bustInfoController");
const { getsearchBus } = require("../controller/searchController");
// const { allocateSeats } = require('../controller/seatController');
// const {  } = require('../controllers/');

const router = express.Router();

router.post("/create/:id", busDetails);
router.put("/update/:id", busDetailsupdate);
router.get("/search", getsearchBus);

module.exports = router;
