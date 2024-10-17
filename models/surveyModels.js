const { DataTypes } = require("sequelize");
const sequelize = require("../config");

module.exports = (sequelize) => {
  const Survey = sequelize.define(
    "Survey",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      SurveyStatusCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CountryLanguageID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      IndustryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      StudyTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ClientCPI: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      ClientSurveyLiveURL: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      TestRedirectURL: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      Quota: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      SurveyName: {
        type: DataTypes.STRING,
      },
      Completes: {
        type: DataTypes.INTEGER,
      },
      FID: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      IR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      LOI: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
      },
      endedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true, // Keeps createdAt and updatedAt columns
    }
  );

  return Survey;
};
