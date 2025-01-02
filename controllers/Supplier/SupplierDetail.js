const {
  Survey,
  Condition,
  Quotas,
  Qualification,
} = require("../../models/association");
const requestIp = require('request-ip')
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('../../models/uniqueSurvey');
const { v4: uuidv4 } = require('uuid');
const SupplyInfo = require("../../models/supModels");
const axios = require("axios");
const Supply = require("../../models/supplyModels");
const sequelize = require("../../config");
const crypto = require("crypto");
const Cookies = require("../../models/cookies");


exports.getSurveyOpiniomea = async(req,res) => {
  try{
    const survey = await ResearchSurvey.findAll({
      attributes : ["bid_length_of_interview", "is_live", "livelink", "bid_incidence", "survey_name", "survey_id", "cpi"],
      where : {
        is_live: 1,
        message_reason: { [Op.ne]: "deactivated" },
        livelink: { [Op.ne]: "" },
      },
      limit : 10,
    })

    res.status(200).json(survey)

  }catch(err) {
    console.log(err);

  }
}


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

function generatePanelId(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}
exports.getChanel = async (req, res) => {
  try {
    const { PNID } = req.query;
    function generatePanelId(length) {
      return Math.random().toString(36).substring(2, 2 + length);
  }

    // Validate query parameter
    if (!PNID) {
      return res.status(400).json({ error: 'PNID is required' });
    }

    // Fetch the survey
    const survey = await ResearchSurvey.findOne({
      where: {
        survey_id: 909090909,
      },
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Generate a unique API ID
    const id = generatePanelId(12);

    // Create the supply information
    const supplyInfo = await SupplyInfo.create({
      SurveyID: 909090909,
      UserID: PNID,
      id: id,
      SupplyID: 9090,
    });

    // Redirect the user
    res.redirect(`https://adhoc.qmapi.com/${supplyInfo.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};
exports.getFacebookChanel = async (req, res) => {
  try {
    
    function generatePanelId(length) {
      return Math.random().toString(36).substring(2, 2 + length);
  }

    const survey = await ResearchSurvey.findOne({
      where: {
        survey_id: 909090909,
      },
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const id = generatePanelId(12);

    const supplyInfo = await SupplyInfo.create({
      SurveyID: 909090909,
      UserID: id,
      id: id,
      SupplyID: 78293,
    });

    // Redirect the user
    res.redirect(`https://adhoc.qmapi.com/${supplyInfo.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
};

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



// Utility function for encryption
function encryptData(data, secretKey) {
  const algorithm = "aes-256-cbc";
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(secretKey, "salt", 32), iv);

  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");

  return `${iv.toString("base64")}:${encrypted}`;
}
function generatePanelId(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}

exports.redirectIndividualCompaign = async (req, res) => {
  try {
    // const { sid } = req.params;
    const { supplyID, PNID } = req.query;
    console.log("ipaddress", req.ip);
    
    const supply = await SupplyPrice.findOne({
      where: { SupplierID : supplyID  },
    });

    function generatePanelId(length) {
      return Math.random().toString(36).substring(2, 2 + length);
  }

    console.log(supply);

    if (!supply) {
      return res.status(404).json({
        status: "error",
        message: "Subscription  not found",
      });
    }

    const supplyInfo = await SupplyInfo.create({
      id : uuidv4(),
      UserID: PNID,
      SupplyID: supplyID,
      SessionID : generatePanelId(length = 8),
      IPAddress : req.ip
    });

    const id = supplyInfo.id;
    console.log(id);

    // console.log(redirectUrl);
    res.redirect(`https://consent.qmapi.com/${id}?prescreen=true`);
  } catch (err) {
    console.error("Error during redirection:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.redirectIndividual = async (req, res) => {
  try {
    // const { sid } = req.params;
    const { station } = req.query;
    console.log("ipaddress", req.ip);
    const state =  78293
    let value = false
    if (station == "fb") {
      value = true
    }
    console.log(value)
    const supply = await SupplyPrice.findOne({
      where: { SupplierID: value ? state : station },
    });

    function generatePanelId(length) {
      return Math.random().toString(36).substring(2, 2 + length);
  }

    console.log(supply);

    if (!supply) {
      return res.status(404).json({
        status: "error",
        message: "Subscription  not found",
      });
    }

    const supplyInfo = await SupplyInfo.create({
      id : uuidv4(),
      UserID: generatePanelId(length = 8),
      SupplyID: state,
      SessionID : generatePanelId(length = 8),
      IPAddress : req.ip
    });

    const id = supplyInfo.id;
    console.log(id);

    // console.log(redirectUrl);
    res.redirect(`https://consent.qmapi.com/${id}?prescreen=true`);
  } catch (err) {
    console.error("Error during redirection:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.redirectToSurvey = async (req, res) => {
  try {
    console.log("generateApiUrl called with:", req.query);

    const { sid } = req.params;
    const isTest = req.path.includes("/test");
    const { SupplyID, PNID, SessionID, TID } = req.query;
    const TokenID = decodeURIComponent(TID);

    const response = await ResearchSurvey.findOne({
      attributes: isTest ? ["testlink", "survey_id"] : ["survey_id", "livelink"],
      where: { survey_id: sid },
    });

    if (!response) {
      return res.status(404).json({ message: "Survey not found" });
    }

    let livelink = isTest ? response.testlink : response.livelink;
    if (!livelink) {
      return res.status(400).json({ message: "Live or test link not found for the survey" });
    }

    if (isTest) {
      return res.redirect(livelink);
    }

    const indexOfSid = livelink.indexOf("SID");
    if (indexOfSid === -1) {
      return res.status(400).json({ message: "Invalid livelink format, missing SID parameter" });
    }

    const sensitiveData = livelink.slice(indexOfSid);
    console.log("Sensitive Data:", sensitiveData);

    const supply = await Supply.findOne({ where: { SupplierID: SupplyID } });
    if (!supply) {
      return res.status(404).json({ status: "error", message: "Supply not found" });
    }

    const hashingKey = supply.HashingKey;
    // console.log(hashingKey);
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const isValidToken = sendTokenAndUrl(TokenID, fullUrl, hashingKey);

    if (!isValidToken) {
      return res.status(403).json({ status: "error", message: "Invalid Token ID" });
    }

    const info = await SupplyInfo.create({
      id : uuidv4(),
      UserID: PNID,
      TID: TokenID,
      SupplyID,
      SurveyID: response.survey_id,
      SessionID,
      IPAddress: req.ip,
    });

    // Redirect to the encrypted link
    const queryParams = `?prescreen=false${isTest ? "&test=true" : ""}`;
    const redirectUrl = `https://consent.qmapi.com/${info.id}${queryParams}&${sensitiveData}`;
    console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);

  } catch (err) {
    console.error("Error redirecting to survey:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



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
    
    const supplyInfo = await SupplyInfo.create({
      id : uuidv4(),
      UserID: PNID,
      TID : TID,
      SupplyID: SupplyID,
      SessionID : SessionID,
      IPAddress : req.ip
    });

    const id = supplyInfo.id;
    console.log(id);

    // console.log(redirectUrl);
    res.redirect(`https://consent.qmapi.com/${id}?prescreen=true`);
  } catch (err) {
    console.error("Error during redirection:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.convertSurvey = async (req, res) => {
  try {
    const { AID } = req.params;
    const { survey_id } = req.query;

    const survey = await SupplyInfo.findOne({
      where: {
        id: AID
      }
    });

    if (survey) {
      await survey.update({
        SurveyID: survey_id
      });

      return res.status(200).json({ message: "Survey ID updated successfully" });
    } else {
      return res.status(404).json({ message: "Record not found" });
    }
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred", error: err });
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


const { Op } = require("sequelize");
exports.buyerData = async (req, res) => {
  try {
    const { PID: queryPID, MID, TokenID, ClientStatus, InitialStatus, pnid } = req.query;
    const { status } = req.params;
    let PID = queryPID;

    if (!PID && pnid) {
      PID = pnid;
    }

    if (!PID) {
      return res.status(400).json({
        status: "error",
        message: "PID or pnid is required",
      });
    }

    // Fetch supply information
    const supply = await SupplyInfo.findOne({ 
      where: { id: PID },
      attributes: ['SupplyID', 'UserID']
    });

    if (!supply) {
      return res.status(404).json({
        status: "error",
        message: "Supply not found",
      });
    }

    const supplier = await Supply.findOne({
      where: { SupplierID: supply.SupplyID },
      attributes: ['Complete', 'Termination', 'OverQuota', 'Quality']
    });

    if (!supplier) {
      return res.status(404).json({
        status: "error",
        message: "Supplier not found",
      });
    }

    // Update supply info
    const updateData = { 
      status, 
      task: JSON.stringify(req.body), 
      InitialStatus,
      ClientStatus
    };
    await SupplyInfo.update(updateData, { where: { id: PID } });

    // Map status to redirect URL
    const statusRedirectMap = {
      complete: supplier.Complete,
      terminate: supplier.Termination,
      overquota: supplier.OverQuota,
      default: supplier.Quality
    };

    let redirectUrl = statusRedirectMap[status];

if (!redirectUrl) {
  console.error(`No redirect URL found for status: ${status}`);
  return res.status(400).json({
    status: "error",
    message: `No redirect URL defined for status: ${status}`,
  });
}
const userid = supply.UserID ;
// Replace [%AID%] in the redirect URL with the UserID from supply
redirectUrl = redirectUrl.replace("[%AID%]", userid);
console.log("Final Redirect URL:", redirectUrl);

    
    return res.redirect(redirectUrl);

  } catch (err) {
    console.error("Buyer Data Error:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};


// const finalRedirectUrl = redirectUrl.replace("[%AID%]", supply.UserID);

// return res.redirect(finalRedirectUrl);

//     // return res.redirect(redirectUrl);

//   } catch (err) {
//     console.error("Buyer Data Error:", err);
//     return res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };


exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch ReportInfo using the SurveyID
    const ReportInfo = await SupplyInfo.findAll({
      attributes : ["createdAt", "updatedAt", "status", "id", "UserID","SupplyID","SurveyID"],
      where: {
        SupplyID: id,
      },
    });
    const surveyIDs = ReportInfo.map((report) => report.SurveyID);
    console.log(surveyIDs)

    const SurveyInfo = await ResearchSurvey.findOne({
      where :{
        survey_id : surveyIDs
      }
    });

    // Check if ReportInfo or SurveyInfo is null/undefined
    if (!ReportInfo || !SurveyInfo) {
      return res
        .status(404)
        .json({ status: "failed", message: "Data not found" });
    }

    // Add SurveyInfo details to each ReportInfo item
    const mergedInfo = ReportInfo.map((report) => ({
      panelistId : report.UserID,
      AID : report.id,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      status: report.status,
      SurveyID: SurveyInfo.survey_id, 
      SurveyName: SurveyInfo.survey_name, 
      status: SurveyInfo.islive,
      cpi: SurveyInfo.cpi,
      country_language : SurveyInfo.country_language,
      IR : SurveyInfo.bid_incidence,
      LOI : SurveyInfo.bid_length_of_interview
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
