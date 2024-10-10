const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const CountryLang = sequelize.define("CountryDetail", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
  },
  CountryLanguage: {
    type: DataTypes.STRING,
  },
});

module.exports = CountryLang;
