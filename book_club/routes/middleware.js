// routes/middleware.js

// This middleware checks if the user is logged in.
// If there's no session userId, redirect them to /login.
function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    next();
  }
  
  // Export the function so other files can use it
  module.exports = { requireLogin };
  