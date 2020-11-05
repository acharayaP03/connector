const express = require('express');

const { check, validationResult } = require('express-validator');

const router = express.Router();

const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');

const User = require('../../models/User');

/**
 * @route   GET api/profile
 * @description get all user profile
 * @access  Public
 */

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.log(err.message);

    return res.status(500).send('Server Error');
  }
});
/**
 * @route   GET api/profile/user/:user_id
 * @description get user profile
 * @access  Public
 */

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
      'name',
      'avatar',
    ]);
    if (!profile) return res.status(400).json({ msg: 'There is no profile for this user.' });

    return res.json(profile);
  } catch (err) {
    console.log(err.message);

    if (err.kind === 'ObjectId')
      return res.status(400).json({ msg: 'There is no profile for this user.' });

    return res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/profile/me
 * @description get profile for the logged in user
 * @access  Private
 */

router.get('/me', auth, async (req, res) => {
  const { id } = req.user;
  try {
    const profile = await Profile.findOne({ user: id }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'User profile doesnt exits.' });
    }
    return res.json(profile);
  } catch (err) {
    console.log(err.message);

    res.status(500).send('Server Error');
  }
});

/**
 * @route   Post api/profile/
 * @description Create or Update user profile
 * @access  Private
 */

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // build porfile object
    const profileFields = {};
    // since token that was sent will have user id along with it, we can extract most of the details from it to send it to mongo db.
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    // since we need to turn skills comes as comma separated, we need to turn that into arrar.
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }
    // console.log(profileFields.skills); // [ 'html', 'php', 'ruby', 'react' ]

    // Build Social object
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // id profile exist then update.
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // if porfile doesnt exist then create it.
      profile = new Profile(profileFields);

      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }

    res.send('Hello');
  }
);

/**
 * @route   Deelete api/Profile
 * @description Delete profile and user related post
 * @access  Private
 */

router.delete('/', auth, async (req, res) => {
  try {
    // Remove porfile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    return res.json({ msg: 'User profile deleted.' });
  } catch (err) {
    console.log(err.message);

    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT api/Profile/experience
 * @description Add user experience on profile.
 * @access  Private
 */

router.put(
  '/experience',
  [
    auth,
    check('title', 'Title is required.').not().isEmpty(),
    check('company', 'Company is required.').not().isEmpty(),
    check('from', 'From date is required.').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExperience);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);

      res.status(500).send('Server Error');
    }
  }
);

/**
 * @route   DELETE api/profile/experience/exp_id
 * @description delete experience for user
 * @access  Private
 */

router.delete('/experience/:exp_id', auth, async (req, res) => {
  const { id } = req.user;
  try {
    const profile = await Profile.findOne({ user: id });

    // Since this is an array, we need to remove index of it.
    const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    profile.save();

    return res.json(profile);
  } catch (err) {
    console.log(err.message);

    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT api/Profile/education
 * @description Add user education on profile.
 * @access  Private
 */

router.put(
  '/education',
  [
    auth,
    check('school', 'School is required.').not().isEmpty(),
    check('degree', 'Degree is required.').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required.').not().isEmpty(),
    check('from', 'From date is required.').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEducation);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);

      res.status(500).send('Server Error');
    }
  }
);

/**
 * @route   DELETE api/profile/education/edu_id
 * @description delete education for user
 * @access  Private
 */

router.delete('/education/:edu_id', auth, async (req, res) => {
  const { id } = req.user;
  try {
    const profile = await Profile.findOne({ user: id });

    // Since this is an array, we need to remove index of it.
    const removeIndex = profile.education.map((item) => item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    profile.save();

    return res.json(profile);
  } catch (err) {
    console.log(err.message);

    res.status(500).send('Server Error');
  }
});

module.exports = router;
