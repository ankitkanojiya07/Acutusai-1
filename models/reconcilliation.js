const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Reconcillation = sequelize.define(
  "Reconcillation",
  { 
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    ApiKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    SurveyID: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    UserID:{
        type: DataTypes.STRING,
        allowNull: false
    }
  },
  {
    timestamps: true, // Ensure Sequelize adds createdAt and updatedAt automatically
  }
);

module.exports = Reconcillation;
