const { Survey, Condition, Quotas, Qualification } = require("../../models/association");
const SupplyInfo = require('../../models/supModels')
const axios = require('axios');
const Supply = require('../../models/supplyModels');
const sequelize = require("../../config");
const crypto = require("crypto");

function encryptUrl(url, hashingKey) {
  const hmac = crypto.createHmac('sha256', hashingKey); // Using HMAC with SHA-256
  hmac.update(url);
  const encryptedUrl = hmac.digest('base64'); // Convert to base64 encoding
  return encryptedUrl;
}

function sendTokenAndUrl(TID, url, hashingKey) {
  const urlIndex = url.indexOf("TID=");

  // Only encrypt the URL part before the TokenID query
  const urlToEncrypt = url.slice(0, urlIndex-1); // Exclude "TID" and rest of URL
  const encryptedUrl = encryptUrl(urlToEncrypt, hashingKey); // Encrypt with hashingKey

  console.log("Encrypted URL: ", encryptedUrl);
  console.log("TID: ", TID);

  // Compare TID with the encrypted URL
  return TID === encryptedUrl;
}
function generateApiUrl(
  surveyID,
  supplyID = "%SID%",
  PNID = "%PNID%",
  TID = "%TID%"
) {
  const baseUrl = "http://localhost:3000/api/v2/survey/";
  const queryParams = `supplyID=${encodeURIComponent(
    supplyId
  )}&PNID=${encodeURIComponent(
    PNID
  )}&TID=${encodeURIComponent(TID)}`;
  return `${baseUrl}?${surveyID}?${queryParams}`;
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
    
    // Fetch survey with associated qualifications
    const survey = await Survey.findByPk(id, {
      include: [
        {
          model: Qualification,
          as: "Qualifications", // Make sure this alias matches the association
        },
      ],
    });

    // Check if the survey exists
    if (!survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }

    // Return the qualifications data
    res.status(200).json({
      status: "success",
      data: survey.Qualifications, // Return associated qualifications
    });
  } catch (err) {
    console.error("Error fetching survey qualification:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const SupplyPrice = require("../../models/supplyModels");

exports.redirectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { TID, PNID, supplyID } = req.query;
    console.log(TID);
    const TokenId = decodeURIComponent(TID);
    const apikey = req.headers["authorization"];

    console.log(req.query);
    console.log(id, apikey);

    // Find survey by SurveyID
    const survey = await Survey.findByPk(id);
    // console.log(survey);
    if (!survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }

    const supply = await SupplyPrice.findOne({
      where: { ApiKey: apikey },
    });

    if (!supply) {
      return res.status(404).json({
        status: "error",
        message: "Supply not found",
      });
    }

    const hashingKey = supply.HashingKey; 
    console.log(hashingKey);

    
    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

    // Check if TokenID matches the encrypted URL
    const isValidToken = sendTokenAndUrl(TokenId, fullUrl, hashingKey);

    if (!isValidToken) {
      return res.status(403).json({
        status: "error",
        message: "Invalid Token ID",
      });
    }

    // If valid, save supply info
    const supplyInfo = await SupplyInfo.create({
      SurveyID: id, // Use `id` from the URL
      UserID : PNID,
      TID,
      SupplyID : supplyID,
    });

    // Replace token in the redirect URL and redirect
    const redirectUrl = survey.TestRedirectURL.replace("[%AID%]", id);
    console.log(redirectUrl);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Error during redirection:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
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
