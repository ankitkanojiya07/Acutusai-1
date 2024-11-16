const { DataTypes } = require("sequelize");
const sequelize = require("../config"); 

const UQualification = sequelize.define("Qualification", {
    country_language: {
      type: DataTypes.INTEGER,
    },
    country_language_code: {
      type: DataTypes.STRING,
      
    },
    question_id: {
      type: DataTypes.INTEGER,
      
    },
    name: {
      type: DataTypes.TEXT,
      
    },
    type: {
      type: DataTypes.TEXT,
    },
    question: {
      type: DataTypes.TEXT,
    },
    answer: {
      type: DataTypes.TEXT,
    },
    precode: {
      type: DataTypes.TEXT,
    },
    

  }, {
    tableName: "Qualification",
    timestamps : false
  });

module.exports = UQualification;