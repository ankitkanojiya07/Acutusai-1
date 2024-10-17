const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config");


const Quotas = sequelize.define(
  "Quotas",
  {
    SurveyQuotaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SurveyQuotaType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    Quota: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
    Completes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = (sequelize, DataTypes) => Quotas;
