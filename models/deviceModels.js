const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config");

const DeviceInfo = sequelize.define(
  "DeviceInfo",
  {
    FingerPrintID: {
      type: DataTypes.STRING,
    },
    UserAgent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DeviceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Browser: {
      type: DataTypes.INTEGER,
    },
    IpAddress: {
      type: DataTypes.STRING,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = DeviceInfo; 
