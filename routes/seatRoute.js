const express = require("express");
const {
  allocateSeats,
  allseats,
  updateseat,
  deleteseat,
  pdfphone,
} = require("../controller/seatController");
const {
  getsearchAll,
  getsearchAllByseat,
  getsearchRouteByvillage,
  ticketsearch,
  getchartprint,
  getSeatsByDate,
  getSeatsByMobile,
} = require("../controller/searchController");
// const {  } = require('../controllers/');

const router = express.Router();

router.post("/create/:id", allocateSeats);
router.get("/read", allseats);
router.get("/pdf", pdfphone);
router.put("/update/:id", updateseat);
router.delete("/delete/:id", deleteseat);
router.get("/search", getsearchAll);
router.get("/searchbyseats", getSeatsByDate);
router.get("/searchbyallseat", getsearchAllByseat);
router.post("/searchTicket", ticketsearch);
router.get("/getchartprint", getchartprint);
router.get("/getseatsByMobile", getSeatsByMobile);
module.exports = router;
