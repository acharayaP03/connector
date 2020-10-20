const express = require('express');
const router = express.Router();

/**
 * @route   GET api/users
 * @description Test Route
 * @access  Public
*/

router.get('/', (req, res) =>{
    res.send("posts Route.")
});

module.exports = router;