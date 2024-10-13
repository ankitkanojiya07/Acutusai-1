const { DataTypes } = require("sequelize");
const sequelize = require("../config");

// Import models
const SurveyModel = require("./surveyModels");
const QuotaModel = require("./quotaModels");
const ConditionModel = require("./conditionModels");
const QualificationModel = require("./qualificationModels");

// Initialize models
const Survey = SurveyModel(sequelize, DataTypes);
const Quotas = QuotaModel(sequelize, DataTypes);
const Condition = ConditionModel(sequelize, DataTypes);
const Qualification = QualificationModel(sequelize, DataTypes);

// Set up associations
Survey.hasMany(Quotas, {
  foreignKey: "SurveyID",
  as: "Quotas",
});

Survey.hasMany(Qualification, {
  foreignKey: "SurveyID",
  as: "Qualifications",
});

Quotas.belongsTo(Survey, {
  foreignKey: "SurveyID",
  as: "Survey",
});

Quotas.hasMany(Condition, {
  foreignKey: "SurveyQuotaID",
  as: "Conditions",
});

Condition.belongsTo(Quotas, {
  foreignKey: "SurveyQuotaID",
  as: "Quota",
});

module.exports = {
  sequelize,
  Survey,
  Quotas,
  Condition,
  Qualification
};