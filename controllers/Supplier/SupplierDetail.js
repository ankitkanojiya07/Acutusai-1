const {
  Survey,
  Condition,
  Quotas,
  Qualification,
} = require("../../models/association");
const requestIp = require('request-ip')
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('../../models/uniqueSurvey');

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
  const urlToEncrypt = url.slice(0, urlIndex - 1);
  console.log(urlToEncrypt); // Exclude "TID" and rest of URL
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
  const baseUrl = "https://api.qmapi.com/api/v2/survey/redirect";
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

exports.fetchSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findOne({
      where: {
        id: id
      }
    });
    console.log(survey);

    if (survey) {
      res.status(200).json({data : survey});
    } else {
      return res.status(404).json({ message: 'Survey not found' });
    }
    
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

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
    const survey = await ResearchSurvey.findAll( {
      where :{
        survey_id : id

      },
      attributes: ['survey_id', 'survey_name'],
      include: [
        {
          model: ResearchSurveyQualification,
          as: "survey_qualifications", // Make sure this alias matches the association
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
      data: survey, // Return associated qualifications
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
    // const { sid } = req.params;
    const { TID, PNID, SessionID, SupplyID } = req.query;
    console.log(TID);

    console.log("ipaddress", req.ip);
    const TokenId = decodeURIComponent(TID);
   
    const supply = await SupplyPrice.findOne({
      where: { SupplierID: SupplyID },
    });

    console.log(supply);

    if (!supply) {
      return res.status(404).json({
        status: "error",
        message: "Supply not found",
      });
    }

    const hashingKey = supply.HashingKey;
    console.log(hashingKey);

    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    console.log(fullUrl);
    const isValidToken = sendTokenAndUrl(TokenId, fullUrl, hashingKey);

    if (!isValidToken) {
      return res.status(403).json({
        status: "error",
        message: "Invalid Token ID",
      });
    }
    console.log("yes");
    
    // If valid, save supply info
    const supplyInfo = await SupplyInfo.create({
      UserID: PNID,
      TID : TID,
      SupplyID: SupplyID,
      SessionID : SessionID,
      IPAddress : req.ip
    });

    const id = supplyInfo.id;
    console.log(id);

    // console.log(redirectUrl);
    res.redirect(`https://consent.qmapi.com/${id}`);
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
    const survey = await ResearchSurvey.findOne({
      where : {
        survey_id : id
      },
      attributes: ['survey_id', 'survey_name'],
      include: [{ model: ResearchSurveyQuota, as: "survey_quotas" }], // Capitalized 'Quotas'
    });

    if (!survey) {
      return res.status(404).json({
        status: "error",
        message: "Survey not found",
      });
    }

    res.status(200).json({
      status: "success",
      data : survey
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
    const { PNID, MID, TokenID } = req.query;
    const { status } = req.params;
    console.log("Received status:", status);
    console.log("Request Query:", req.query);

    // Fetch the supply information
    const Sup = await SupplyInfo.findOne({ where: { id: PNID } });
    if (!Sup) {
      return res.status(404).json({
        status: "error",
        message: "Supply not found",
      });
    }

    console.log("SupplyID is:", Sup.SupplyID);

    // Update the status of the supply
    const info = await SupplyInfo.update({ status }, { where: { id: PNID } });
    console.log("Update Info:", info);

    // Fetch the supplier information
    const Supplier = await Supply.findOne({
      where: { SupplierID: Sup.SupplyID },
    });
    if (!Supplier) {
      return res.status(404).json({
        status: "error",
        message: "Supplier not found",
      });
    }

    console.log("Supplier Termination URL:", Supplier.Termination);

    // Redirect based on status
    let redirectUrl;
    if (status === "complete") {
      redirectUrl = `${Supplier.Complete}?AID=${PNID}`;
    } else if (status === "terminate") {
      redirectUrl = `${Supplier.Termination}?AID=${PNID}`;
    } else if (status === "overquota") {
      redirectUrl = `${Supplier.OverQuota}?AID=${PNID}`;
    } else {
      redirectUrl = `${Supplier.Quality}?AID=${PNID}`;
    }

    // Perform server-side redirect
    console.log("Redirecting to:", redirectUrl);
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("Error occurred:", err);
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

exports.Complete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const CompInfo = await SupplyInfo.findAll({
      where: {
        status: "Complete"
      }
    });
    const TermInfo = await SupplyInfo.findAll({
      where: {
        status: "Terminate"
      }
    });

    const EntrantInfo = await SupplyInfo.findAll({
      where : {
        SurveyID : id
      }
    })

    const conversionRate = CompInfo.length / (CompInfo.length + TermInfo.length)
    const DropOffRate  = (EntrantInfo.length - CompInfo.length ) / EntrantInfo.length
    const incidenceRate = CompInfo.length / (CompInfo.length + TermInfo.length)

    res.status(200).json({ Compcount: CompInfo.length, Termcount : TermInfo.length, conversionRate : conversionRate, EntrantInfo : EntrantInfo.length, DropOffRate : DropOffRate, incidenceRate : incidenceRate });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


var getIP = require('ipware')().get_ip;


exports.CookiesDetail = async (req, res) => {
  try {
    // var ipInfo = getIP(req);
    // console.log(ipInfo);
    const { id } = req.params; 
    // console.log("idea",req.connection.remoteAddress);
    // console.log(req.headers)
    const ip = requestIp.getClientIp(req)
    const { panelistId, sessionID, ipAddress } = req.body;
    console.log(ipAddress)

    // Create new cookie details in the database
    const newCookie = await Cookies.create({
      AID : panelistId,
      CookiesData : "data",
      IpAddress : ipAddress,
      sessionID,
    });

    return res.status(201).json({ status: "success", data: newCookie });
  } catch (err) {
    // Handle errors properly
    return res.status(500).json({ status: "error", message: err.message });
  }
};
