const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcrypt");
const User = require("../models/user.js"); // Importing the default export User

const UserModel = User; // Using the User directly

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find the user by username
      const user = await UserModel.findOne({ where: { username } });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      // Check if the password is correct
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return done(null, false, { message: "Incorrect password" });
      }
      // If authentication succeeds, return the user object
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport; // Change to module.exports
