const { Survey, SurveyQuota, SurveyQualification } = require('../../models/hookSurveyModels');
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('../../models/uniqueSurvey');

async function createSurvey(req, res) {
    try {
        console.log('Request payload size (Content-Length):', req.headers['content-length']);
        const surveys = req.body;
        console.log(surveys[0]); // Expecting an array of survey objects

        const createdOrUpdatedSurveys = await Promise.all(surveys.map(async (surveyData) => {
            const {
                survey_id, survey_name, account_name, country_language, industry, study_type,
                bid_length_of_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
                survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
                total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
                earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
                message_reason, survey_quotas, survey_qualifications
            } = surveyData;

            let existingSurvey = await ResearchSurvey.findOne({ where: { survey_id } });

            // If the survey already exists and message_reason is "updated"
            if (existingSurvey && message_reason === "updated") {
                console.log("Updating existing survey...");

                await existingSurvey.update({
                    survey_name, account_name, country_language, industry, study_type,
                    bid_length_of_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
                    survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
                    total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
                    earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
                    message_reason
                });

                // Update Survey Quotas if provided
                if (survey_quotas) {
                    await ResearchSurveyQuota.destroy({ where: { survey_id } }); // Clear existing quotas
                    await Promise.all(survey_quotas.map(async (quota) => {
                        await ResearchSurveyQuota.create({ ...quota, survey_id });
                    }));
                }

                // Update Survey Qualifications if provided
                if (survey_qualifications) {
                    await ResearchSurveyQualification.destroy({ where: { survey_id } }); // Clear existing qualifications
                    await Promise.all(survey_qualifications.map(async (qualification) => {
                        await ResearchSurveyQualification.create({ ...qualification, survey_id });
                    }));
                }

                return existingSurvey;
            }

            // If the survey does not exist and message_reason is "new"
            if (!existingSurvey && message_reason === "new") {
                console.log("Creating new survey...");
                const newSurvey = await ResearchSurvey.create({
                    survey_id, survey_name, account_name, country_language, industry, study_type,
                    bid_length_of_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
                    survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
                    total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
                    earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
                    message_reason
                });

                // Add associated SurveyQuotas if provided
                if (survey_quotas) {
                    const quotaPromises = survey_quotas.map((quota) => {
                        // Ensure upsert is based on survey_quota_id and survey_id
                        return ResearchSurveyQuota.upsert({
                            ...quota,
                            survey_id: newSurvey.survey_id // Explicitly add the survey_id to each quota
                        }, {
                            // Use both survey_quota_id and survey_id for the unique constraint
                            conflictFields: ['survey_quota_id', 'survey_id']
                        });
                    });
                
                    await Promise.all(quotaPromises); // Ensures all promises are resolved
                }
                
                

                // Add associated SurveyQualifications if provided
                if (survey_qualifications) {
                    await Promise.all(survey_qualifications.map(async (qualification) => {
                        await ResearchSurveyQualification.create({ ...qualification, survey_id: newSurvey.survey_id });
                    }));
                }

                return newSurvey;
            }else {
                console.log("message reason ", message_reason)
            }

            console.log("No action taken for survey_id:", survey_id);
            return null;
        }));

        res.status(201).json({
            message: 'Surveys created or updated successfully',
            surveys: createdOrUpdatedSurveys.filter(s => s !== null)
        });
    } catch (error) {
        console.error('Error creating or updating surveys:', error);
        res.status(500).json({ message: 'Error creating or updating surveys', error: error.message });
    }
}

module.exports = { createSurvey };
