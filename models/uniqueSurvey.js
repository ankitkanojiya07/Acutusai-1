const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config');

// Survey model
class ResearchSurvey extends Model {}

ResearchSurvey.init({
    id: {
        
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    survey_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false
    },
    survey_name: DataTypes.STRING,
    account_name: DataTypes.STRING,
    country_language: DataTypes.STRING,
    industry: DataTypes.STRING,
    study_type: DataTypes.STRING,
    bid_length_of_interview: DataTypes.INTEGER,
    bid_incidence: DataTypes.FLOAT,
    collects_pii: DataTypes.BOOLEAN,
    survey_group_ids: DataTypes.JSON,
    is_live: DataTypes.BOOLEAN,
    survey_quota_calc_type: DataTypes.STRING,
    is_only_supplier_in_group: DataTypes.BOOLEAN,
    cpi: DataTypes.FLOAT,
    total_client_entrants: DataTypes.INTEGER,
    total_remaining: DataTypes.INTEGER,
    completion_percentage: DataTypes.FLOAT,
    conversion: DataTypes.FLOAT,
    overall_completes: DataTypes.INTEGER,
    mobile_conversion: DataTypes.FLOAT,
    earnings_per_click: DataTypes.FLOAT,
    livelink : DataTypes.TEXT,
    testlink : DataTypes.TEXT,
    length_of_interview: DataTypes.INTEGER,
    termination_length_of_interview: DataTypes.INTEGER,
    respondent_pids: DataTypes.JSON,
    message_reason: DataTypes.STRING
}, {
    sequelize,
    modelName: 'ResearchSurvey',
    tableName: 'research_surveys',  // Changed table name
    indexes: [
        {
            fields: ['survey_id']  // Add index on survey_id for better query performance
        }
    ]
});

// SurveyQuota model
class ResearchSurveyQuota extends Model {}

ResearchSurveyQuota.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    survey_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: ResearchSurvey, key: 'survey_id' } // Corrected model reference
    },
    survey_quota_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    survey_quota_type: DataTypes.STRING,
    quota_cpi: DataTypes.FLOAT,
    conversion: DataTypes.FLOAT,
    number_of_respondents: DataTypes.INTEGER,
    questions: DataTypes.JSON
}, {
    sequelize,
    modelName: 'ResearchSurveyQuota',
    tableName: 'research_survey_quotas' ,
    indexes: [{ fields: ['survey_id', 'survey_quota_id'] }]
});

// SurveyQualification model
class ResearchSurveyQualification extends Model {}

ResearchSurveyQualification.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    survey_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: ResearchSurvey, key: 'survey_id' } // Corrected model reference
    },
    logical_operator: DataTypes.STRING,
    precodes: DataTypes.JSON,
    question_id: DataTypes.INTEGER
}, {
    sequelize,
    modelName: 'ResearchSurveyQualification',
    tableName: 'research_survey_qualifications' 
});

// Associations
ResearchSurvey.hasMany(ResearchSurveyQuota, { 
    foreignKey: 'survey_id', 
    sourceKey: 'survey_id', 
    as: 'survey_quotas'
});
ResearchSurveyQuota.belongsTo(ResearchSurvey, { 
    foreignKey: 'survey_id',
    targetKey: 'survey_id'
});

ResearchSurvey.hasMany(ResearchSurveyQualification, { 
    foreignKey: 'survey_id', 
    sourceKey: 'survey_id', 
    as: 'survey_qualifications'
});
ResearchSurveyQualification.belongsTo(ResearchSurvey, { 
    foreignKey: 'survey_id', 
    targetKey: 'survey_id'
});

module.exports = { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification };
