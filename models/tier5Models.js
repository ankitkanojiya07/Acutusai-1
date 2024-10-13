
const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Tier5= sequelize.define(
  "Tier5",
  {
    IR: {
      type: DataTypes.INTEGER,
      AllowNull: false,
      primaryKey: true,
    },
    1: {
      type: DataTypes.STRING,
    },
    2: {
      type: DataTypes.STRING,
    },
    3: {
      type: DataTypes.STRING,
    },
    4: {
      type: DataTypes.STRING,
    },
    5: {
      type: DataTypes.STRING,
    },
    6: {
      type: DataTypes.STRING,
    },
    7: {
      type: DataTypes.STRING,
    },
    8: {
      type: DataTypes.STRING,
    },
    9: {
      type: DataTypes.STRING,
    },
    10: {
      type: DataTypes.STRING,
    },
    15: {
      type: DataTypes.STRING,
    },
    20: {
      type: DataTypes.STRING,
    },
    25: {
      type: DataTypes.STRING,
    },
    30: {
      type: DataTypes.STRING,
    },
    40: {
      type: DataTypes.STRING,
    },
    50: {
      type: DataTypes.STRING,
    },
    60: {
      type: DataTypes.STRING,
    },
    70: {
      type: DataTypes.STRING,
    },
    80: {
      type: DataTypes.STRING,
    },
    90: {
      type: DataTypes.STRING,
    },
    100: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "tier5",
    timestamps: false,
  }
);

module.exports = Tier5;