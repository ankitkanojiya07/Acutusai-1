const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Qualification = sequelize.define(
    "Qualification",
    {
      QualificationID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      SurveyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Surveys",
          key: "id",
        },
      },
      QuestionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID of the survey question for qualification",
      },
      PreCodes: {
        type: DataTypes.TEXT,
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
      timestamps: true,
      tableName: "Qualifications",
    }
  );

  return Qualification;
};