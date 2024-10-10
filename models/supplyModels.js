const { DataTypes } = require("sequelize");
const sequelize = require("../config");

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
    
    StatusLink: {
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
