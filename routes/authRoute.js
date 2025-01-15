const express = require('express');
const { login, signup, removeip } = require('../controller/authController');




const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.delete('/removeip/:id', removeip);




module.exports = router;