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
 * @route   GET api/posts/:id
 * @description Get posts by id
 * @access  Private
 * @invalidPostId  if invalid post id is entered then this will catch it 
 *  if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'Post not found' });
    @errorRetruned Cast to ObjectId failed for value "5fa521126885af1078db9d41ghsfghsf" at path "_id" for model "post"
 */

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ msg: 'Post not found' });
    }

    return res.json(post);
  } catch (err) {
    console.log(err.message);

    if (err.kind === 'ObjectId') return res.status(400).json({ msg: 'Post not found' });

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
