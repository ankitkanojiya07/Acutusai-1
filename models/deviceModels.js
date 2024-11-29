const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config");

const DeviceInfo = sequelize.define(
  "DeviceInfo",
  {
    FingerPrintID: {
      type: DataTypes.STRING,
      allowNull: false,

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
      type: DataTypes.STRING,
      allowNull: false,
    },
    IpAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIP: true,  // Validate IP address format
      },
    },
    PanelistId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    OperatingSystem: {
      type: DataTypes.STRING,
    },
    ScreenResolution: {
      type: DataTypes.STRING,
    },
    ColorDepth: {
      type: DataTypes.INTEGER,
    },
    TimeZone: {
      type: DataTypes.STRING,
    },
    Language: {
      type: DataTypes.STRING,
    },
    IsTouchDevice: {
      type: DataTypes.BOOLEAN,
    },
    CookiesEnabled: {
      type: DataTypes.BOOLEAN,
    },
    JavaEnabled: {
      type: DataTypes.BOOLEAN,
    },
    Timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,  // Automatically add `createdAt` and `updatedAt` fields
  }
);

module.exports = DeviceInfo;
