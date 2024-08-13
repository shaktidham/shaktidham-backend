const express = require('express');
const { allocateSeats,allseats,updateseat,deleteseat } = require('../controller/seatController');
const { getsearchAll } = require('../controller/searchController');
// const {  } = require('../controllers/');


const router = express.Router();

router.post('/create/:id', allocateSeats);
router.get('/read', allseats);
router.put('/update/:id', updateseat);
router.delete('/delete/:id', deleteseat);
router.get('/search', getsearchAll);


module.exports = router;