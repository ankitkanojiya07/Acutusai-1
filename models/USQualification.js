const { DataTypes } = require("sequelize");
const sequelize = require("../config"); 

const Question = sequelize.define("USQualification", {
    Question_ID: {
      type: DataTypes.INTEGER,
    },
    Label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Question: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Precodes: {
      type: DataTypes.TEXT,
    },
    

  }, {
    tableName: "USQualification",
    timestamps: true,
  });

module.exports = Question;