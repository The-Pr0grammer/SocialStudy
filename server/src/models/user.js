// server/src/models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path if necessary

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
