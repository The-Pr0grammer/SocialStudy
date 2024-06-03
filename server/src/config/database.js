// server/src/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('socialstudydb', 'adot824', 'ajnchick', {
  host: 'localhost',
  dialect: 'postgres', // Explicitly specify the dialect
});

module.exports = sequelize;
