const { Survey, Condition, Quotas, Qualification } = require("../../models/association");
const sequelize = require("../../config");
const crypto = require("crypto");
const Supply = require('../../models/supplyModels');

function generateApiUrl(
  surveyID,
  supplyID = "%SupplyID%",
  PNID = "%PNID%",
  SessionID = "%sessionID%",
  TID = "%TokenID%"
) {
  const baseUrl = "https://api.acutusai.com/api/v2/survey/redirect";
  const queryParams = `supplyID=${encodeURIComponent(
    supplyID
  )}&PNID=${encodeURIComponent(PNID)}&SessionID=${encodeURIComponent(
    SessionID
  )}&TID=${encodeURIComponent(TID)}`;
  return `${baseUrl}?surveyID=${surveyID}&${queryParams}`;
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

exports.getLiveSurveys = async (req, res) => {
  const apiKey = req.headers.authorization;  // Get API key from request headers

  if (!apiKey) {
    return res.status(403).json({ message: "No API key provided" });
  }

  try {
    const surveys = await Survey.findAll({
      where: { status: "live" },
      attributes: { exclude: ["ClientSurveyLiveURL", "TestRedirectURL", "FID", "SurveyStatusCode", "CountryLanguageID", "ClientCPI"] },
      include: [
        {
          model: Quotas,
          as: "Quotas",
          include: [
            {
              model: Condition,
              as: "Conditions"
            }
          ]
        },
        {
          model: Qualification,
          as: "Qualifications"
        }
      ]
    });

    console.log("Fetched surveys:", surveys.length);

    // Use Promise.all to handle asynchronous processing for all surveys and pass API key
    const responseData = await Promise.all(surveys.map(survey => processSurvey(survey, apiKey)));

    console.log("Processed surveys:", responseData.length);

    res.status(200).json({
      status: "success",
      data: responseData,
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
