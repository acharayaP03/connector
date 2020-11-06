const express = require('express');

const router = express.Router();

const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');

const User = require('../../models/User');

const Post = require('../../models/Post');

/**
 * @route   GET api/posts
 * @description Get all posts
 * @access  Private
 *
 */

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    return res.json(posts);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});

/**
 * @route   POST api/users
 * @description Create Post  Route
 * @access  Private
 */

router.post('/', [auth, check('text', 'Text is required.').not().isEmpty()], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-passowrd');

    const newPost = Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    });

    const post = await newPost.save();

    res.json(post);
  } catch (err) {
    console.log(err.message);

    return res.status(500).send('Server Error');
  }
});

module.exports = router;
