const sequelize = require("../../config");
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('../../models/uniqueSurvey');
const SupplyInfo = require("../../models/supModels");

const gettingReport = async (req, res) => {
    try {
        const getReporting = await SupplyInfo.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('status')), 'count']
            ],
            where: {
                SupplyID: 2580,
                status: ['complete', 'terminate', 'overquota', 'quality']
            },
            group: ['status']
        });

        const report = {};
        getReporting.forEach(item => {
            report[item.status] = parseInt(item.dataValues.count, 10);
        });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "An error occurred while generating the report.",
            error: err.message
        });
    }
};

module.exports = { gettingReport };
