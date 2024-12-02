// const { Survey, Condition, Quotas, Qualification } = require("../../models/association");
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('../../models/uniqueSurvey');
const { RateEntry }= require("../../models/SupplierRateCard");
const sequelize = require("../../config");
const { Op } = require("sequelize");
const crypto = require("crypto");
const Supply = require('../../models/supplyModels');
const QualificationModel = require("../../models/USQualification");

function generateApiUrl(
  survey_id,
  supply_id = "SupplyID",
  AID = "AID",
  Session_id = "sessionID",
  TID = "TokenID"
) {
  const baseUrl = "https://api.qmapi.com/api/v2/survey/redirect";
  const queryParams = `SupplyID=[%${encodeURIComponent(
    supply_id
  )}%]&PNID=[%${encodeURIComponent(AID)}%]&SessionID=[%${encodeURIComponent(
    Session_id 
  )}%]&TID=[%${encodeURIComponent(TID)}%]`;
  return `${baseUrl}/${survey_id}?${queryParams}`;
}
function generateTestUrl(
  survey_id,
  supply_id = "SupplyID",
  AID = "AID",
  Session_id = "sessionID",
  TID = "TokenID"
) {
  const baseUrl = "https://api.qmapi.com/api/v2/survey/redirect";
  const queryParams = `SupplyID=[%${encodeURIComponent(
    supply_id
  )}%]`;
  return `${baseUrl}/${survey_id}/test?${queryParams}`;
}



exports.getAllSurveys = async (req, res) => {
  try {
    // Retrieve all surveys from the database
    const surveys = await Survey.findAll();

    // Respond with the list of surveys
    res.status(200).json({
      status: "success",
      data: surveys,
    });
  } catch (err) {
    // Handle any errors that occur during the retrieval process
    console.error("Error fetching surveys:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// exports.getAllSurveysDetail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("idea", id);

//     const surveys = await Survey.findAll({
//       where: {
//         id: id,
//       },
//     });

//     if (surveys.length === 0) {
//       return res.status(404).json({
//         status: "not found",

//         message: "No survey found with the given ID",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: surveys[0],
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       status: "error",
//       message: "An error occurred while fetching the surveys",
//       error: err.message,
//     });
//   }
// };

// Handle request to get all live surveys
const RateCard = require("../../models/SupplierRateCard");

const generateCPI = async (IR, LOI,  apiKey) => {
  try {
    console.log("hhsd",apiKey);
    const sup = await Supply.findOne({
      where : {
        ApiKey : apiKey
      }
    })

    console.log(sup.SupplierID)
    const rateCard = await RateCard.findOne({
      where: {
        IR: LOI,  // IR and LOI should not be mixed here unless intentional
        
        SupplyID: sup.SupplierID,
       
      },
    });

    console.log(rateCard);

    // Return some calculated CPI based on rateCard
    return rateCard ? rateCard.get('IR') : null; 
  } catch (err) {
    console.error("Error in generateCPI:", err);
    return null; // Return null or a default value in case of error
  }
};

const processSurvey = async (survey, apiKey) => {
  const { id, IR, LOI, ...surveyData } = survey.toJSON();

  // Generate Survey CPI using the async function and pass the API key
  const SurveyCPI = await generateCPI(IR, LOI, apiKey);

  return {
    ...surveyData,
    id,
    LiveURL: generateApiUrl(id),
    TestURL: generateApiUrl(id),
    SurveyCPI,  // Append SurveyCPI to the result
  };
};
async function getRate(rateCard, LOI, IR) {
  try {
    console.log("Transfer", rateCard, LOI, IR);

    const rateEntries = await RateEntry.findOne({
      where: {
        rateCardId: rateCard,
        irMin: { [Op.lte]: IR },
        irMax: { [Op.gte]: IR },
        loiMin: { [Op.lte]: LOI },
        loiMax: { [Op.gte]: LOI },
      },
    });

    if (!rateEntries) {
      throw new Error(`Rate not found for IR ${IR} and LOI ${LOI} in rate card ${rateCard}`);
    }

    console.log(rateEntries.rate);
    return rateEntries.rate;
  } catch (error) {
    console.error("Error in getRate:", error.message);
    throw error;
  }
}

exports.getLiveSurveys = async (req, res) => {
  const apiKey = req.headers.authorization;

  if (!apiKey) {
    return res.status(403).json({ message: "No API key provided" });
  }

  try {
    const Rate = await Supply.findOne({
      attributes: ["apikey", "RateCard"],
      where: { ApiKey: apiKey },
    });

    if (!Rate) {
      return res.status(403).json({ message: "Invalid API key" });
    }

    const surveys = await ResearchSurvey.findAll({
      attributes: { exclude: ["account_name", "survey_name"] },
      where: {
        is_live: 1,
        message_reason: { [Op.ne]: "deactivated" },
        livelink: { [Op.ne]: "" },
      },
      include: [
        {
          model: ResearchSurveyQuota,
          as: "survey_quotas",
          attributes: { exclude: ["quota_cpi"] },
        },
        {
          model: ResearchSurveyQualification,
          as: "survey_qualifications",
        },
      ],
      limit: 50,
    });

    const processedSurveys = await Promise.all(
      surveys.map(async (survey) => {
        const surveyData = survey.toJSON();
        const LOI = surveyData.bid_length_of_interview;
        const IR = surveyData.bid_incidence;

        const value = await getRate(Rate.RateCard, LOI, IR);
        const cut = JSON.parse(surveyData.revenue_per_interview);

        // Skip surveys where the value is not greater than CPI.
        if (value >= Number(cut.value)) {
          return null;
        }

        surveyData.cpi = value;
        surveyData.revenue_per_interview = value;
        surveyData.livelink = generateApiUrl(surveyData.survey_id);
        surveyData.testlink = generateTestUrl(surveyData.survey_id);

        const qualifications = await Promise.all(
          surveyData.survey_qualifications.map(async (qualification) => {
            const questionDetails = await QualificationModel.findOne({
              where: { question_id: qualification.question_id },
              attributes: ["name", "question", "question_id", "Acutusai"],
            });

            return {
              ...qualification,
              question_id: questionDetails
                ? questionDetails.Acutusai || qualification.question_id
                : qualification.question_id,
            };
          })
        );

        surveyData.survey_qualifications = qualifications;

        return surveyData;
      })
    );

    // Filter out null surveys
    const validSurveys = processedSurveys.filter((survey) => survey !== null);

    res.status(200).json({
      status: "success",
      data: validSurveys,
    });
  } catch (err) {
    console.error("Error in getLiveSurveys:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: err.message,
    });
  }
};





exports.getFinishedSurveys = async (req, res) => {
  try {
    // Retrieve surveys with status "finished"
    const surveys = await Survey.findAll({
      where: {
        status: "finished",
      },
    });

    res.status(200).json({
      status: "success",
      data: surveys,
    });
  } catch (err) {
    console.error("Error fetching finished surveys:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// exports.getSurveyLink = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const survey = await Survey.findByPk(id);
//     if (!survey) {
//       return res.status(404).json({
//         status: "error",
//         message: "Survey not found",
//       });
//     }
//     const surveyUrl = generateApiUrl(survey.id);
//     res.status(200).json({
//       status: "success",
//       data: {
//         liveUrl: surveyUrl,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching survey link:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };
