const express = require('express');
const router = express.Router();

// using express validator to validate user's reques.
/**
 * @params
 * @ExpressValidator documentation.
 * @check pass it as a middleware array
 */

const { check, validationResult } = require('express-validator');

/**
 * @route   POST api/users
 * @description Test Route
 * @access  Public
 */

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email.').isEmail(),
    check('password', 'Please enter a password with 6 or more characters.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    res.send('Users Route.');
  }
);

module.exports = router;
