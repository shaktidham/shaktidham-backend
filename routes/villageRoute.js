const express = require("express");
const {
  villageDetails,
  villageread,
  villageUpdate,
  villagedelete,
} = require("../controller/villageController.js");

const router = express.Router();

router.post("/create", villageDetails);
router.get("/read", villageread);
router.put("/update/:id", villageUpdate);
router.delete("/delete/:id", villagedelete);

module.exports = router;
