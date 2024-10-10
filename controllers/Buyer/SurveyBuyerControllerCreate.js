const { Survey, Condition, Quotas } = require("../../models/association");
const sequelize = require("../../config");

const validateRequiredFields = (fields) => {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => value == null || value === "")
    .map(([key]) => key);
  return missingFields;
};

function checkHttps(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function validateNumber(number, min, max) {
  return number >= min && number <= max;
}

const validateHttpsUrls = (urls) => {
  const insecureUrls = Object.entries(urls)
    .filter(([_, url]) => url && !checkHttps(url))
    .map(([key]) => key);
  return insecureUrls;
};

const validateLOIAndIR = (LOI, IR) => {
  if (!validateNumber(LOI, 0, 60)) {
    return "LOI must be between 0 and 60";
  }
  if (!validateNumber(IR, 0, 100)) {
    return "IR must be between 0 and 100";
  }
  return null;
};

const createSurveyWithQuotas = async (surveyData, quotas, transaction) => {
  const survey = await Survey.create(surveyData, { transaction });

  if (quotas && Array.isArray(quotas)) {
    await Promise.all(
      quotas.map(async (quotaData) => {
        const quota = await Quotas.create(
          {
            ...quotaData,
            SurveyID: survey.id,
          },
          { transaction }
        );

        if (quotaData.Conditions && Array.isArray(quotaData.Conditions)) {
          await Promise.all(
            quotaData.Conditions.map((conditionData) =>
              Condition.create(
                {
                  ...conditionData,
                  SurveyQuotaID: quota.SurveyQuotaID,
                },
                { transaction }
              )
            )
          );
        }
      })
    );
  }

  return survey;
};

const fetchSurveyWithDetails = async (surveyId) => {
  return await Survey.findByPk(surveyId, {
    include: [
      {
        model: Quotas,
        as: "Quotas",
        include: [{ model: Condition, as: "Conditions" }],
      },
    ],
    attributes: { exclude: ["id"] },
  });
};

// Main Function
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
    const missingFields = validateRequiredFields(requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate URLs for HTTPS
    const urlsToCheck = { ClientSurveyLiveURL, TestRedirectURL };
    const insecureUrls = validateHttpsUrls(urlsToCheck);
    if (insecureUrls.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: `Please use secure URLs (https) for: ${insecureUrls.join(", ")}`,
      });
    }

    // Validate LOI and IR
    const validationError = validateLOIAndIR(LOI, IR);
    if (validationError) {
      return res.status(400).json({
        status: "fail",
        message: validationError,
      });
    }

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      const surveyData = {
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
      };

      return await createSurveyWithQuotas(surveyData, quotas, t);
    });

    // Fetch the newly created survey with associated quotas and conditions
    const surveyWithDetails = await fetchSurveyWithDetails(result.id);

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
