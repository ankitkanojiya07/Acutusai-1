const { Survey, Condition, Quotas } = require("../../models/association");
const sequelize = require("../../config");
const crypto = require("crypto");

function generateApiUrl(
  surveyId,
  supplyId = "%SID%",
  PNID = "%PNID%",
  sessionId = "%SSID%"
) {
  const baseUrl = "http://localhost:3000";
  const queryParams = `supplyId=${encodeURIComponent(
    supplyId
  )}&PNId=${encodeURIComponent(
    PNID
  )}&sessionID=${encodeURIComponent(sessionId)}`;
  return `${baseUrl}/${surveyId}?${queryParams}`;
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
const processSurvey = (survey) => {
  const { id, ...surveyData } = survey.toJSON();
  return {
    ...surveyData,
    id,
    LiveURL: generateApiUrl(id),
    TestURL: generateApiUrl(id),
  };
};

exports.getLiveSurveys = async (req, res) => {
  
  try {
    const surveys = await Survey.findAll({
      where: { status: "live" },
      attributes: { exclude: ["ClientSurveyLiveURL", "TestRedirectURL"] },
    });

    console.log("Fetched surveys:", surveys.length);

    const responseData = surveys.map(processSurvey);

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
