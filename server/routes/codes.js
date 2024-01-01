var express = require('express');
const codes = require('../controllers/codes')
const authorize = require('../verifytoken.js')
var router = express.Router();

router.get('/:id', authorize, codes.getCodes)

router.post('/add', authorize, codes.addCode)

router.get('/del/:id', authorize, codes.deleteCode)

router.post('/update/:id', authorize, codes.updateCode)


module.exports = router;