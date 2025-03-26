// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // Page d’accueil
  res.render('index');
});

module.exports = router;
