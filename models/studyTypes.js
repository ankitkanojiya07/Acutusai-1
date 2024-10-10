const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const studyTypes = sequelize.define("Survey", {
  Code: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  ID: {
    type: DataTypes.INTEGER, // Changed to DataTypes.INTEGER
    allowNull: false,
  },

  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = studyTypes;
