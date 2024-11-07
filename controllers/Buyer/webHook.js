const { Survey, SurveyQuota, SurveyQualification } = require('../../models/hookSurveyModels');

async function createSurvey(req, res) {
    try {
        console.log('Request payload size (Content-Length):', req.headers['content-length']);
        const surveys = req.body;
        console.log(surveys[0])// Expecting an array of survey objects

        const createdSurveys = await Promise.all(surveys.map(async (surveyData) => {
            const {
                survey_id, survey_name, account_name, country_language, industry, study_type,
                bid_length_of_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
                survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
                total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
                earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
                message_reason, survey_quotas, survey_qualifications
            } = surveyData;

            // Create the main Survey entry
            const newSurvey = await Survey.create({
                survey_id, survey_name, account_name, country_language, industry, study_type,
                bid_length_of_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
                survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
                total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
                earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
                message_reason
            });

            // Add associated SurveyQuotas if provided
            if (survey_quotas) {
                await Promise.all(survey_quotas.map(async (quota) => {
                    await SurveyQuota.create({ ...quota, survey_id: newSurvey.survey_id });
                }));
            }

            // Add associated SurveyQualifications if provided
            if (survey_qualifications) {
                await Promise.all(survey_qualifications.map(async (qualification) => {
                    await SurveyQualification.create({ ...qualification, survey_id: newSurvey.survey_id });
                }));
            }

            return newSurvey;  // Return the created survey for response
        }));

        res.status(201).json({
            message: 'Surveys created successfully',
            surveys: createdSurveys
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating surveys', error });
    }
}


module.exports = { createSurvey };
