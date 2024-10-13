const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config");

const BuyerInfo = sequelize.define(
  "BuyerInfo",
  {
    FID:{
      type: DataTypes.STRING,
    },
    IR: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ApiKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    LOI: {
      type: DataTypes.INTEGER,
    },
    Country: {
      type: DataTypes.STRING,  // Fixed the incomplete type definition
    }
  },
  {
    timestamps: true,
  }
);

module.exports = BuyerInfo; // Fixed incorrect export name
