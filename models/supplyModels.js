const { DataTypes } = require("sequelize");
const sequelize = require("../config");
const { RateCard } = require("./SupplierRateCard");

const Supply = sequelize.define(
  "Supply",
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

    SupplierID: {
      type: DataTypes.INTEGER,
    },
    RateCard : DataTypes.INTEGER,
    Quality: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Complete: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    Termination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    OverQuota: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SupplierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    HashingKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = Supply;
