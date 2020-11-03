const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const config = require('config');

// using express validator to validate user's reques.

const { check, validationResult } = require('express-validator');

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

/**
 * @route   POST api/users
 * @description Login in route/ Authenticate User on login
 * @access  Public
 */

router.post(
  '/',
  [
    check('email', 'Please enter a valid email.').isEmail(),
    check('password', 'password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      // check if user already exist.
      let user = await User.findOne({ email });

      if (!user) {
        // if the return statement not present then this will throw headers already sent error.

        return res.status(400).json({ error: [{ msg: 'Invalid Credentials.' }] });
      }

      // compare password on he db
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // if the return statement not present then this will throw headers already sent error.
        return res.status(400).json({ error: [{ msg: 'Invalid Credentials.' }] });
      }
      // return jwt.

      const paylaod = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        paylaod,
        config.get('jwtsecret'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);

      res.status(500).send('Something went wrong, please try again later.');
    }
  }
);

module.exports = router;
