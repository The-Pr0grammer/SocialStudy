// server/routes/roomRoutes.js

const express = require('express');
const router = express.Router();

// Middleware to authenticate requests
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Route for word game
router.get('/wordgame', isAuthenticated, (req, res) => {
  // Serve data for the word game
  res.json({ message: 'Welcome to the word game room' });
});

// Route for chill room
router.get('/chillroom', isAuthenticated, (req, res) => {
  // Serve data for the chill room
  res.json({ message: 'Welcome to the chill room' });
});

// Route for homework room
router.get('/homeworkroom', isAuthenticated, (req, res) => {
  // Serve data for the homework room
  res.json({ message: 'Welcome to the homework room' });
});

module.exports = router;
