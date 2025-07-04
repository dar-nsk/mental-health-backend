/*const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/counselordashboard', authMiddleware, (req, res) => {
  if (req.user.role !== 'counselor') {
    return res.status(403).send('Forbidden');
  }
  res.send('Welcome to counselor dashboard');
});

module.exports = router;*/
