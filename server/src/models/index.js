// server/src/models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path if necessary

const User = require('./user'); // Adjust the path if necessary

const db = {
  User,
  sequelize,
  Sequelize,
};

module.exports = db;
