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

/**
 * @route api/post/like/:id
 * @description PUT Like post.
 * @access  Private
 */

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // filter likes
    const filterLike = post.likes.filter((like) => like.user.toString() === req.user.id);

    if (filterLike.length > 0) {
      return res.status(400).json({ msg: 'Post already Liked.' });
    }

    // if not liked yet then like it.
    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.log(err.message);

    return res.status(500).send('Server Error');
  }
});

/**
 * @route api/post/unlike/:id
 * @description PUT Like post.
 * @access  Private
 */

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // filter likes
    const filterLike = post.likes.filter((like) => like.user.toString() === req.user.id);

    if (filterLike.length === 0) {
      return res.status(400).json({ msg: 'Post has not yet been liked yet.' });
    }

    // if not liked yet then like it.
    const removeIndex = post.likes.map((like) => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.log(err.message);

    return res.status(500).send('Server Error');
  }
});


/**
 * @route   POST api/post/comment/:id
 * @description Comment on Post(id params is the id of post)
 * @access  Private
 */

router.post('/comment/:id', [auth, check('text', 'Text is required.').not().isEmpty()], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-passowrd');
    const post = await Post.findById(req.params.id);

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    };

    post.comments.unshift(newComment);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.log(err.message);

    return res.status(500).send('Server Error');
  }
});

/**
 * @route    api/posts/:id
 * @description DELETE posts
 * @access  Private
 * @Authorized Only authorized user can delete post.
 * @objectId post.user.toString will convet id to oject id.
 */

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // if post doesnt exit
    if (!post) {
      return res.status(400).json({ msg: 'Post not found' });
    }

    // check if user is authorized to delete, or if post belongs to the user.
    if (post.user.toString() !== req.user.id) {
      return res.status(400).json({ msg: 'User not authorized.' });
    }

    await post.remove();

    return res.json({ msg: 'Post successfully removed.' });
  } catch (err) {
    console.log(err.message);

    // check if the id of the post matches
    if (err.kind === 'ObjectId') return res.status(400).json({ msg: 'Post not found' });

    return res.status(500).send('Server Error');
  }
});


/**
 * @route   DEKETE api/post/comment/:id/:comment_id
 * @description Comment on Post(id params is the id of post) and comment_id
 * @access  Private
 */

 router.delete('/comment/:id/:comment_id', auth, async (req, res) =>{

  try {
    const post = await Post.findById(req.params.id);
    // get comment
    const comment = post.comments.find((comment) => comment.id === req.params.comment_id);

    // make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // check usr, only user who worte comment can delete it,
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'You are not authorized to delete this.' });
    }

    // if not liked yet then like it.
    const removeIndex = post.comments.map((comment) => comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);               
  } catch (err) {
    console.log(err.message);

    return res.status(500).send('Server Error');
  }
 })

module.exports = router;
