// server/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const passport = require("../config/passport");

// Route for user registration
router.post("/register", async (req, res, next) => {
  try {
    console.log("Register route hit");
    await userController.createUser(req, res);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Route for user login
router.post("/login", (req, res, next) => {
  console.log("Login route hit");
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // Pass the error to the error handling middleware
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err); // Pass the error to the error handling middleware
      }
      res.json({ message: "Login successful" });
    });
  })(req, res, next);
});

module.exports = router;
