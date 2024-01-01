var express = require('express');
const users = require('../controllers/users')
const authorize = require('../verifytoken.js')
var router = express.Router();

router.get('/',authorize, users.getAll)

router.post('/signup', users.registerUser)

router.post('/login', users.authenticateUser)

module.exports = router;
