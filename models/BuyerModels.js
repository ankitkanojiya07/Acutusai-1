const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config");

const Buyer = sequelize.define(
  "Buyer",
  {
    AccountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    AccountID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    ApiKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    BusinessUnitID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    HashingKey: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = Buyer;
