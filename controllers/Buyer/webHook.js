const axios = require('axios');
const { Survey, SurveyQuota, SurveyQualification } = require('../../models/hookSurveyModels');
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('../../models/uniqueSurvey');

// Function to fetch livelink and testlink from Lucid API
async function fetchLinksFromLucid(survey_id) {
    const postUrl = `https://api.samplicio.us/Supply/v1/SupplierLinks/Create/${survey_id}/6588`;
    const params = { 'SupplierLinkTypeCode': 'OWS', 'TrackingTypeCode': 'NONE' };
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'A8B96D8F-AB75-4C8C-B692-BE7AC2665BA7',
        'Accept': 'text/plain',
    };

    try {
        console.log('Attempting POST request...');
        const postResponse = await axios.post(postUrl, params, { headers });

        if (postResponse.status === 200 && postResponse.data.SupplierLink) {
            const { LiveLink, TestLink, DefaultLink } = postResponse.data.SupplierLink;
            return {
                livelink: DefaultLink === null ? "Not" : LiveLink || null,
                testlink: TestLink || null,
            };
        }

        console.error('POST request did not return valid SupplierLink data.');
        return { livelink: null, testlink: null };

    } catch (error) {
        console.error('Error fetching links from Lucid:', error.message);
        return { livelink: null, testlink: null };
    }
}

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
                message_reason, revenue_per_interview, survey_quotas, survey_qualifications,
            } = surveyData;

            let existingSurvey = await ResearchSurvey.findOne({ where: { survey_id } });

            if (existingSurvey && message_reason === "reactivated") {
                console.log("Reactivating survey...");
                await existingSurvey.update({ message_reason });
                console.log(`Survey ${survey_id} reactivated successfully.`);
                return existingSurvey;
            }

            if (existingSurvey && message_reason === "deactivated") {
                console.log("Deactivating survey...");
                await existingSurvey.update({ message_reason });
                console.log(`Survey ${survey_id} deactivated successfully.`);
                return existingSurvey;
            }

            if (existingSurvey && message_reason === "updated") {
                console.log("Updating existing survey...");

                await existingSurvey.update({
                    survey_name, account_name, country_language, industry, study_type,
                    bid_length_of_interview, revenue_per_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
                    survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
                    total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
                    earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
                    message_reason,
                });

                if (survey_quotas) {
                    await ResearchSurveyQuota.destroy({ where: { survey_id } });
                    await Promise.all(survey_quotas.map(async (quota) => {
                        await ResearchSurveyQuota.create({ ...quota, survey_id });
                    }));
                }

                if (survey_qualifications) {
                    await ResearchSurveyQualification.destroy({ where: { survey_id } });
                    await Promise.all(survey_qualifications.map(async (qualification) => {
                        await ResearchSurveyQualification.create({ ...qualification, survey_id });
                    }));
                }

                return existingSurvey;
            }

            if (!existingSurvey && message_reason === "new") {
                console.log("Creating new survey...");

                // Fetch links before creating the survey
                const links = await fetchLinksFromLucid(survey_id);

                // Skip if links are null or livelink is null/"Not"
                if (!links || links.livelink === null || links.livelink === "Not") {
                    console.log(`Skipping survey_id ${survey_id} due to null or invalid livelink`);
                    return null;
                }

                const newSurvey = await ResearchSurvey.create({
                    survey_id, survey_name, account_name, country_language, industry, study_type,
                    bid_length_of_interview, bid_incidence, collects_pii, survey_group_ids, is_live,
                    survey_quota_calc_type, is_only_supplier_in_group, cpi, total_client_entrants,
                    total_remaining, completion_percentage, conversion, overall_completes, mobile_conversion,
                    earnings_per_click, length_of_interview, termination_length_of_interview, respondent_pids,
                    message_reason, revenue_per_interview,
                    livelink: links.livelink,
                    testlink: links.testlink,
                });

                if (survey_quotas) {
                    await Promise.all(survey_quotas.map(async (quota) => {
                        await ResearchSurveyQuota.create({ ...quota, survey_id: newSurvey.survey_id });
                    }));
                }

                if (survey_qualifications) {
                    await Promise.all(survey_qualifications.map(async (qualification) => {
                        await ResearchSurveyQualification.create({ ...qualification, survey_id: newSurvey.survey_id });
                    }));
                }

                return newSurvey;
            }

            console.log("No action taken for survey_id:", survey_id);
            return null;
        }));

        res.status(201).json({
            message: 'Surveys created or updated successfully',
            surveys: createdOrUpdatedSurveys.filter(s => s !== null),
        });
    } catch (error) {
        console.error('Error creating or updating surveys:', error);
        res.status(500).json({ message: 'Error creating or updating surveys', error: error.message });
    }
}

module.exports = { createSurvey };
