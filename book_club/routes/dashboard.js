const express = require('express');
const router = express.Router();
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

router.get('/dashboard', requireLogin, (req, res) => {
  console.log("Dashboard route accessed"); // Debug log
  res.render('dashboard', { session: req.session });
});

module.exports = router;
