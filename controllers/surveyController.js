const { Survey, Condition, Quotas } = require("../models/association");
const sequelize = require("../config");
const crypto = require("crypto");
const Buyer = require("../models/BuyerModels");
const SupplyInfo = require("../models/supModels");

// Function to encrypt a URL using shabase-64
function encryptUrl(url) {
  const hash = crypto.createHash("sha256"); // Using SHA-256 for hashing
  hash.update(url);
  const encryptedUrl = hash.digest("base64"); // Convert to base64 encoding
  return encryptedUrl;
}

// Example supplier side function to send token ID and URL
function sendTokenAndUrl(tokenId, url) {
  const encryptedUrl = encryptUrl(url);
  console.log(`Token ID: ${tokenId}`);
  console.log(`Encrypted URL: ${encryptedUrl}`);

  // Validate if tokenId and encrypted URL match (based on your business logic)
  if (tokenId === encryptedUrl) {
    console.log("Token ID matches the encrypted URL.");
  } else {
    console.log("Token ID does not match the encrypted URL.");
  }
}

function BuyerChecker(ApiKey) {
  const buyer = Buyer.findOne({
    where: {
      ApiKey: ApiKey,
    },
  });
  if (!buyer) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid API key",
    });
  }
  return false;
}

function checkHttps(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function generateApiUrl(
  surveyId,
  supplyId = "%SID%",
  PNID = "%PNID%",
  sessionId = "%SSID%"
) {
  const baseUrl = "https://acutusai.com";
  const queryParams = `supplyId=${encodeURIComponent(
    supplyId
  )}&PNId=${encodeURIComponent(
    PNID
  )}&sessionID=${encodeURIComponent(sessionId)}`;
  return `${baseUrl}/${surveyId}?${queryParams}`;
}

function validateNumber(number, min, max) {
  return number >= min && number <= max;
}

exports.surveyCreate = async (req, res) => {
  try {
    const {
      projectName,
      SurveyStatusCode,
      CountryLanguageID,
      IndustryID,
      StudyTypeID,
      ClientCPI,
      ClientSurveyLiveURL,
      TestRedirectURL,
      IsActive,
      Quota,
      LOI,
      IR,
      SurveyName,
      Completes,
      status,
      country,
      Quotas: quotas,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      projectName,
      IndustryID,
      StudyTypeID,
      ClientCPI,
      TestRedirectURL,
      Quota,
      LOI,
      IR,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value == null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate URLs for https
    const urlsToCheck = { ClientSurveyLiveURL, TestRedirectURL };
    const insecureUrls = Object.entries(urlsToCheck)
      .filter(([_, url]) => url && !checkHttps(url))
      .map(([key]) => key);

    if (insecureUrls.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: `Please use secure URLs (https) for: ${insecureUrls.join(
          ", "
        )}`,
      });
    }

    // Validate LOI and IR
    if (!validateNumber(LOI, 0, 60)) {
      return res.status(400).json({
        status: "fail",
        message: "LOI must be between 0 and 60",
      });
    }
    if (!validateNumber(IR, 0, 100)) {
      return res.status(400).json({
        status: "fail",
        message: "IR must be between 0 and 100",
      });
    }

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const survey = await Survey.create(
        {
          projectName,
          SurveyName,
          SurveyStatusCode,
          CountryLanguageID,
          IndustryID,
          status,
          StudyTypeID,
          Completes,
          ClientCPI,
          ClientSurveyLiveURL,
          TestRedirectURL,
          IsActive,
          Quota,
          LOI,
          IR,
          country,
        },
        { transaction: t }
      );

      // Create associated Quotas if provided
      if (quotas && Array.isArray(quotas)) {
        await Promise.all(
          quotas.map(async (quotaData) => {
            const quota = await Quotas.create(
              {
                ...quotaData,
                SurveyID: survey.id,
              },
              { transaction: t }
            );

            // Create Conditions associated with Quota if provided
            if (quotaData.Conditions && Array.isArray(quotaData.Conditions)) {
              await Promise.all(
                quotaData.Conditions.map((conditionData) =>
                  Condition.create(
                    {
                      ...conditionData,
                      SurveyQuotaID: quota.SurveyQuotaID,
                    },
                    { transaction: t }
                  )
                )
              );
            }
          })
        );
      }

      return survey;
    });

    // Fetch the newly created survey with associated quotas and conditions
    const surveyWithDetails = await Survey.findByPk(result.id, {
      include: [
        {
          model: Quotas,
          as: "Quotas",
          include: [{ model: Condition, as: "Conditions" }],
        },
      ],
      attributes: { exclude: ["id"] },
    });

    res.status(201).json({
      status: "success",
      data: {
        result: surveyWithDetails,
      },
    });
  } catch (err) {
    console.error("Error in surveyCreate:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while creating the survey",
      error: err.message,
    });
  }
};
exports.updateSurvey = async (req, res) => {
  try {
    const { id } = req.params; // Get the survey ID from the URL

    // Find the survey by its ID
    const survey = await Survey.findByPk(id);

    // If survey not found, return a 404 error
    if (!survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }

    console.log(req.body);

    // Update the survey with the provided data
    await survey.update(req.body);

    // Respond with the updated survey data
    res.status(200).json({
      status: "success",
      data: {
        id: survey.id,
        SurveyStatusCode: survey.SurveyStatusCode,
        ClientCPI: survey.ClientCPI,
        ClientSurveyLiveURL: survey.ClientSurveyLiveURL,
        TestRedirectURL: survey.TestRedirectURL,
        IsActive: survey.IsActive,
        Quota: survey.Quota,
      },
    });
  } catch (err) {
    // Handle any errors that occur during the update process
    console.error("Error updating survey:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.buyerData = async (req, res) => {
  try {
    const { AID, status, TokenID } = req.query;

    const Supply = await SupplyInfo.update(
      {
        status: status,
      },
      {
        where: {
          id: AID,
        },
      }
    );

    if (!Supply) {
      return res.status(404).json({
        status: "error",
        message: "Supply not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: Supply,
    });
  } catch (err) {
    console.error("Error fetching buyer data:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// // // Handle request to get all surveys
// exports.getAllSurveys = async (req, res) => {
//   try {
//     // Retrieve all surveys from the database
//     const surveys = await Survey.findAll();

//     // Respond with the list of surveys
//     res.status(200).json({
//       status: "success",
//       data: surveys,
//     });
//   } catch (err) {
//     // Handle any errors that occur during the retrieval process
//     console.error("Error fetching surveys:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

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

// // Handle request to get all live surveys
// const processSurvey = (survey) => {
//   const { id, ...surveyData } = survey.toJSON();
//   return {
//     ...surveyData,
//     id,
//     LiveURL: generateApiUrl(id),
//     TestURL: generateApiUrl(id)
//   };
// };

// exports.getLiveSurveys = async (req, res) => {
//   try {
//     const surveys = await Survey.findAll({
//       where: { status: "live" },
//       attributes: { exclude: ["ClientSurveyLiveURL", "TestRedirectURL"] }
//     });

//     console.log("Fetched surveys:", surveys.length);

//     const responseData = surveys.map(processSurvey);

//     console.log("Processed surveys:", responseData.length);

//     res.status(200).json({
//       status: "success",
//       data: responseData
//     });
//   } catch (err) {
//     console.error("Error in getLiveSurveys:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       error: err.message
//     });
//   }
// };

// exports.getFinishedSurveys = async (req, res) => {
//   try {
//     // Retrieve surveys with status "finished"
//     const surveys = await Survey.findAll({
//       where: {
//         status: "finished",
//       },
//     });

//     res.status(200).json({
//       status: "success",
//       data: surveys,
//     });
//   } catch (err) {
//     console.error("Error fetching finished surveys:", err);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

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

exports.getSurveyQualification = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findByPk(id, {
      include: [{ model: Condition, as: "conditions" }],
    });

    if (!survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: survey.conditions, // Changed to directly reference conditions
    });
  } catch (err) {
    console.error("Error fetching survey qualification:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.redirectUser = async (req, res) => {
  const { SurveyID, TokenID, UserID, SupplyID } = req.query;
  const survey = await Survey.findByPk(SurveyID);
  if (!survey) {
    return res.status(404).json({
      status: "error",
      message: "Survey not found",
    });
  }
  const supplyInfo = await SupplyInfo.create({
    SurveyID,
    UserID,
    TokenID,
    SupplyID,
  });
  const redirectUrl = survey.TestRedirectURL;
  const ok = redirectUrl.replace("[%AID%]", SurveyID);
  res.redirect(ok);
};

exports.getSurveyQuota = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findByPk(id, {
      include: [{ model: Quotas, as: "Quotas" }], // Capitalized 'Quotas'
    });

    if (!survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        Quota: survey.Quotas,
      },
    });
  } catch (err) {
    console.error("Error fetching survey quota:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
