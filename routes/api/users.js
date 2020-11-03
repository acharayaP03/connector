const express = require('express');

const router = express.Router();

const gravatar = require('gravatar');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const config = require('config');

// using express validator to validate user's reques.
/**
 * @params
 * @ExpressValidator documentation.
 * @check pass it as a middleware array
 */

const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
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
    check('password', 'Please enter a password with 6 or more characters.').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
      // check if user already exist.
      let user = await User.findOne({ email });

      if (user) {
        // if the return statement not present then this will throw headers already sent error.

        return res.status(400).json({ error: [{ msg: 'User already exists' }] });
      }
      // Get users gravatar.
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt Password.
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

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
