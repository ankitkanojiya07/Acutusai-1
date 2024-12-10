const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const UserInfo = sequelize.define(
  "UserInfo",
  {
    id: {
      type: DataTypes.INTEGER, // Define the data type
      primaryKey: true,
      autoIncrement: true,
    },
    surveyName: {
      type: DataTypes.STRING,
    },
    liveUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    testUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quota: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surveyStatus: {
      type: DataTypes.STRING,
      defaultValue: "1",
    },
    ir: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    loi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    industries: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qualifications: {
      type: DataTypes.JSON, 
      allowNull: true,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = UserInfo;
