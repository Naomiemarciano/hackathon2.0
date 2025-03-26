const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to require login
function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// GET /register - Show registration form
router.get('/register', (req, res) => {
  res.render('users/register');
});

// POST /register - Process registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();

    // Automatically log the user in after registration
    req.session.userId = user._id;

    // Redirect to /dashboard or /books, depending on your preference:
    res.redirect('/dashboard');
  } catch (err) {
    console.error("Registration error:", err);

    // Render the login page with an error message if registration fails
    // You could also choose to re-render the register page with an error
    res.render('users/login', {
      error: "There was a problem with registration. Please try again or sign in."
    });
  }
});

// GET /login - Show login form
router.get('/login', (req, res) => {
  // If there's an error message, pass it; else pass an empty object
  res.render('users/login', { error: null });
});

// POST /login - Process login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // User not found → display a styled message or render login with error
      return res.send(`
        <div style="text-align: center; font-family: Arial, sans-serif; margin-top: 50px;">
          <h1 style="color:rgb(139, 69, 8);">Oops, didn't find you here!</h1>
          <p>We couldn't find an account with that email.</p>
          <p>Would you like to 
            <a href="/register" style="color: #5bc0de; text-decoration: none; font-weight: bold;">
              Sign Up
            </a>?
          </p>
        </div>
      `);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.send('Incorrect password');
      // Or: res.render('users/login', { error: 'Incorrect password. Please try again.' });
    }

    // Successful login → store user in session and redirect
    req.session.userId = user._id;
    // Decide if you want to go to /books or /dashboard:
    res.redirect('/dashboard');
  } catch (err) {
    console.error("Login error:", err);
    res.send("Error during login");
  }
});

// GET /logout - Log the user out
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// GET /dashboard - Example protected route after login
router.get('/dashboard', requireLogin, (req, res) => {
  // You need a dashboard.ejs file in views/ to render, e.g.:
  // views/dashboard.ejs
  // This file can say "Welcome to your Dashboard" or something
  res.render('dashboard'); 
});

module.exports = router;
