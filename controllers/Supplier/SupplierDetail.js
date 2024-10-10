const { Survey, Condition, Quotas } = require("../../models/association");
const SupplyInfo = require('../../models/supModels')
const axios = require('axios');
const Supply = require('../../models/supplyModels');
const sequelize = require("../../config");
const crypto = require("crypto");

function encryptUrl(url) {
  const hash = crypto.createHash("sha256"); // Using SHA-256 for hashing
  hash.update(url);
  const encryptedUrl = hash.digest("base64"); // Convert to base64 encoding
  console.log(encryptUrl)
  return encryptedUrl;
}

// Example supplier side function to send token ID and URL
function sendTokenAndUrl(tokenId, url) {
  const urlIndex  = url.indexOf("TokenID");
  
  console.log(url.slice(0,urlIndex-1))
  const encryptedUrl = encryptUrl(url.slice(0,urlIndex-1));
  console.log(`Token ID: ${tokenId}`);
  console.log(`Encrypted URL: ${encryptedUrl}`);

  // Validate if tokenId and encrypted URL match (based on your business logic)
  if (tokenId === encryptedUrl) {
    console.log("Token ID matches the encrypted URL.");
  } else {
    
    console.log("Token ID does not match the encrypted URL.");
  }

} 

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

exports.getAllSurveysDetail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("idea", id);

    const surveys = await Survey.findAll({
      where: {
        id: id,
      },
    });

    if (surveys.length === 0) {
      return res.status(404).json({
        status: "not found",

        message: "No survey found with the given ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: surveys[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the surveys",
      error: err.message,
    });
  }
};

exports.getSurveyLink = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }
    const surveyUrl = generateApiUrl(survey.id);
    res.status(200).json({
      status: "success",
      data: {
        liveUrl: surveyUrl,
      },
    });
  } catch (err) {
    console.error("Error fetching survey link:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.getSurveyQualification = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findByPk(id, {
      include: [
        {
          model: Quotas,
          as: "Quotas",
          include: [{ model: Condition, as: "Conditions" }],
        },
      ],
    });

    if (!survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: survey.Quotas.map((quota) => ({
        quotaId: quota.id,
        conditions: quota.Conditions,
      })),
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
  console.log(survey);
  if (!survey) {
    return res.status(404).json({
      status: "error",
      message: "Survey not found",
    });
  }

  console.log("hello")

  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  const result =  sendTokenAndUrl(TokenID,fullUrl);
  console.log(result);

  const supplyInfo = await SupplyInfo.create({
    SurveyID,
    UserID,
    TokenID,
    SupplyID,
  });

  console.log(supplyInfo);


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

exports.buyerData = async (req, res) => {
  try {
    const { AID, status, TokenID } = req.query;
    console.log("Request Query:", req.query);

    const Sup = await SupplyInfo.findOne({
      where: { id: AID },
    });

    if (!Sup) {
      return res.status(404).json({
        status: "error",
        message: "Supply not found",
      });
    }

    const SupplyO = await SupplyInfo.update(
      { status },
      { where: { id: AID }, returning: true }
    );
    const Survey = await Supply.findOne({
      where: { SupplierID: Sup.SupplyID },
    });

    if (!Survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }

    if (!Survey.StatusLink) {
      return res.status(400).json({
        status: "error",
        message: "StatusLink not found",
      });
    }

    const Url = `${Survey.StatusLink}/comp?query=${status}`;
    console.log("Making request to:", Url);

    await axios.get(Url);

    
    res.status(200).json({
      status: "success",
      data: Survey,
    });
  } catch (err) {
    console.error("Error fetching buyer data:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
