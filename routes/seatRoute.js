const express = require("express");
const {
  allocateSeats,
  allseats,
  updateseat,
  deleteseat,
} = require("../controller/seatController");
const {
  getsearchAll,
  getsearchAllByseat,
  getsearchRouteByvillage,
  ticketsearch,
  getsearchRouteBymobile,
  getchartprint,
} = require("../controller/searchController");
// const {  } = require('../controllers/');

const router = express.Router();

router.post("/create/:id", allocateSeats);
router.get("/read", allseats);

router.put("/update/:id", updateseat);
router.delete("/delete/:id", deleteseat);
router.get("/search", getsearchAll);
router.get("/searchbymobile", getsearchRouteBymobile);
router.get("/searchbyallseat", getsearchAllByseat);
router.post("/searchTicket", ticketsearch);
router.get("/getchartprint", getchartprint);
module.exports = router;
