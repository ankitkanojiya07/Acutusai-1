const { DataTypes } = require("sequelize");
const sequelize = require("../config");
const { CookiesDetail } = require("../controllers/Supplier/SupplierDetail");

const Cookies = sequelize.define("Cookies", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  AID: {
    type: DataTypes.STRING,
  },
  CookiesData: {
    type: DataTypes.STRING,
  },
  IpAddress : {
    type : DataTypes.STRING
  },
  SessionID: {
    type: DataTypes.STRING
  }
});

module.exports = Cookies;
