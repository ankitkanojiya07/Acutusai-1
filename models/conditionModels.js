const { DataTypes } = require("sequelize");
const sequelize = require("../config");

module.exports = (sequelize, DataTypes) => {
  const Condition = sequelize.define(
    "Condition",
    {
      ConditionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      SurveyQuotaID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Quotas",
          key: "SurveyQuotaID",
        },
      },
      QuestionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PreCodes: {
        type: DataTypes.TEXT, // Use TEXT to store JSON-serialized array
        allowNull: false,
        get() {
          const rawValue = this.getDataValue("PreCodes");
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue("PreCodes", JSON.stringify(value));
        },
      },
    },
    {
      tableName: "Conditions",
      timestamps: false,
    }
  );

  return Condition;
};             
