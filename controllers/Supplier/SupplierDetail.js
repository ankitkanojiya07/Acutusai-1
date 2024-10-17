const {
  Survey,
  Condition,
  Quotas,
  Qualification,
} = require("../../models/association");
const SupplyInfo = require("../../models/supModels");
const axios = require("axios");
const Supply = require("../../models/supplyModels");
const sequelize = require("../../config");
const crypto = require("crypto");
const Cookies = require("../../models/cookies");

function encryptUrl(url, hashingKey) {
  const hmac = crypto.createHmac("sha256", hashingKey); // Using HMAC with SHA-256
  hmac.update(url);
  const encryptedUrl = hmac.digest("base64"); // Convert to base64 encoding
  return encryptedUrl;
}

function sendTokenAndUrl(TID, url, hashingKey) {
  const urlIndex = url.indexOf("TID=");

  // Only encrypt the URL part before the TokenID query
  const urlToEncrypt = url.slice(0, urlIndex - 1); // Exclude "TID" and rest of URL
  const encryptedUrl = encryptUrl(urlToEncrypt, hashingKey); // Encrypt with hashingKey

  console.log("Encrypted URL: ", encryptedUrl);
  console.log("TID: ", TID);

  // Compare TID with the encrypted URL
  return TID === encryptedUrl;
}
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
    const { sid } = req.params;
    const { TID, PNID, supplyID, SessionID } = req.query;
    console.log(TID);
    const TokenId = decodeURIComponent(TID);
    const apikey = req.headers["authorization"];

    console.log(req.query);
    console.log(sid, apikey);

    // Find survey by SurveyID
    const survey = await Survey.findByPk(sid);
    console.log(survey);
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

    const isValidToken = sendTokenAndUrl(TokenId, fullUrl, hashingKey);

    if (!isValidToken) {
      return res.status(403).json({
        status: "error",
        message: "Invalid Token ID",
      });
    }

    // If valid, save supply info
    const supplyInfo = await SupplyInfo.create({
      SurveyID: sid, // Use `id` from the URL
      UserID: PNID,
      TID,
      SupplyID: supplyID,
      SessionID,
    });

    const redirectUrl = survey.TestRedirectURL.replace("[%AID%]", supplyInfo.id);
    
    const id = supplyInfo.id;

    console.log(redirectUrl);
    res.redirect(`https://consent.acutusai.com?aid=${id}&sessionid=${SessionID}&sid=${sid}`);
  } catch (err) {
    console.error("Error during redirection:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.getDetail = async(req,res) => {
  try{
    const { id } = req.params;

    const info = await Survey.findOne({
      where : {
        id : id
      }
    })
    res.status(200).json({
      status: "success",
      info
    });

  }catch(err){
    console.error(err)
  }
}
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

exports.detail = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch ReportInfo using the SurveyID
    const ReportInfo = await SupplyInfo.findAll({
      where: {
        SurveyID: id,
      },
    });

    // Fetch SurveyInfo using the primary key
    const SurveyInfo = await Survey.findByPk(id);

    // Check if ReportInfo or SurveyInfo is null/undefined
    if (!ReportInfo || !SurveyInfo) {
      return res
        .status(404)
        .json({ status: "failed", message: "Data not found" });
    }

    // Add SurveyInfo details to each ReportInfo item
    const mergedInfo = ReportInfo.map((report) => ({
      ...report.toJSON(), // Convert report instance to plain object
      SurveyName: SurveyInfo.SurveyName, // Add SurveyName from SurveyInfo
      status: SurveyInfo.status, // Add status from SurveyInfo
    }));

    // Return merged information
    return res.status(200).json(mergedInfo);
  } catch (error) {
    // Handle any errors
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.CookiesDetail = async (req, res) => {
  try {
    const { id } = req.params; // 'id' is retrieved but not used in the current implementation
    console.log(req.connection.remoteAddress);
    const { panelistId,  IpAddress, sessionID } = req.body;

    // Create new cookie details in the database
    const newCookie = await Cookies.create({
      AID : panelistId,
      CookiesData : "data",
      IpAddress : req.connection.remoteAddress,
      sessionID,
    });

    // Send success response
    return res.status(201).json({ status: "success", data: newCookie });
  } catch (err) {
    // Handle errors properly
    return res.status(500).json({ status: "error", message: err.message });
  }
};
