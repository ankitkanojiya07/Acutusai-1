const { DataTypes } = require("sequelize");
const sequelize = require("../config");

// Import models
const SurveyModel = require("./surveyModels");
const QuotaModel = require("./quotaModels");
const ConditionModel = require("./conditionModels");

// Initialize models
const Survey = SurveyModel(sequelize, DataTypes);
const Quotas = QuotaModel(sequelize, DataTypes);
const Condition = ConditionModel(sequelize, DataTypes);

// Set up associations
Survey.hasMany(Quotas, {
  foreignKey: "SurveyID",
  as: "Quotas",
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
};
