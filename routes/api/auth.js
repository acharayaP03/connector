const express = require('express');

const router = express.Router();

const User = require('../../models/User');

const auth = require('../../middleware/auth');
/**
 * @route   GET api/auth
 * @description Test Route
 * @access  Public
 * @auth middleware will varify token and return user's details
 */

router.get('/', auth, async (req, res) => {
  try {
    // select('-passowrd) will leave off password and return all the details of user of varified token
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

module.exports = router;
