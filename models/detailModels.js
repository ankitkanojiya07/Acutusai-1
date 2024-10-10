const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Detail = sequelize.define("Detail", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SurveyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Live_Url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Test_Url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Survey_CPI: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Client_CPI: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Detail;
