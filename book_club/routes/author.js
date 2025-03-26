const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireLogin } = require('./middleware');  // Import from the new file

// Display an author's profile
router.get('/authors/:id', async (req, res) => {
  try {
    const author = await User.findById(req.params.id);
    if (!author) {
      return res.send('Author not found');
    }
    res.render('authors/profile', { author });
  } catch (error) {
    console.error(error);
    res.send('Error retrieving author profile');
  }
});

// Display form to edit author profile (CV)
router.get('/authors/:id/edit', requireLogin, async (req, res) => {
  try {
    // Only allow the logged-in user to edit their own profile
    if (req.session.userId !== req.params.id) {
      return res.send("You're not authorized to edit this profile");
    }
    const author = await User.findById(req.params.id);
    if (!author) return res.send('Author not found');
    res.render('authors/editProfile', { author });
  } catch (error) {
    console.error(error);
    res.send('Error retrieving profile for editing');
  }
});

// Handle profile update
router.post('/authors/:id/edit', requireLogin, async (req, res) => {
  try {
    if (req.session.userId !== req.params.id) {
      return res.send("You're not authorized to edit this profile");
    }
    const { bio } = req.body;
    const author = await User.findById(req.params.id);
    if (!author) return res.send('Author not found');
    author.bio = bio;
    await author.save();
    res.redirect(`/authors/${author._id}`);
  } catch (error) {
    console.error(error);
    res.send('Error updating profile');
  }
});

module.exports = router;
