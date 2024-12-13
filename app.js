const express = require("express");
const cors = require("cors");
const app = express();
const compression = require("compression");
const deviceDetail = require("./controllers/Supplier/deviceData");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const Question = require("./models/USQualification");
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('./models/uniqueSurvey');
const bodyParser = require('body-parser');
const surveyDetailController = require("./controllers/Supplier/SupplierDetail");
const Auth = require("./Authenication/BuyerCreate");
const SupplyAuth = require("./Authenication/SupplierCreate");
const surveyRoutes = require("./Authenication/BuyerAuth");
const detailRoutes = require("./Authenication/SupplyAuth");
const Hook = require("./controllers/Buyer/webHook")
const SupplyInfo = require("./models/supModels")
const UserInfo = require("./controllers/Supplier/token");
const UQualification = require("./models/USQualification")
console.log(process.memoryUsage());
app.use(cors());
app.set("trust proxy", true);
// app.use(express.json());
app.use(bodyParser({limit: '50mb'}));
app.use(compression());
async function fetchLinksFromLucid(survey_id) {
  const url = `https://api.samplicio.us/Supply/v1/SupplierLinks/BySurveyNumber/${survey_id}/6588`;
    const params = { 'SupplierLinkTypeCode': 'OWS', 'TrackingTypeCode': 'NONE' };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'A8B96D8F-AB75-4C8C-B692-BE7AC2665BA7',
    'Accept': 'text/plain'
  };

  try {
    const response = await axios.get(url, params=params, { headers });
    
    if (response.status === 200 && response.data && response.data.SupplierLink) {
      const { LiveLink, TestLink } = response.data.SupplierLink;
      return {
        livelink: LiveLink || null,
        testlink: TestLink || null
      };
    }
    
    console.error('Failed to fetch links:', response.data);
    return { livelink: null, testlink: null };
  } catch (error) {
    console.error('Error fetching links from Lucid:', error.message);
    return { livelink: null, testlink: null };
  }
}

app.get("/gh", async (req, res) => {
  try {
    // Fetch all surveys with a null livelink
    const surveys = await ResearchSurvey.findAll({
      attributes: ["livelink", "testlink", "survey_id"],
      where: {
        livelink: null
      },
      limit: 400
    });


    if (!surveys || surveys.length === 0) {
      return res.json({ status: "success", message: "No surveys to update" });
    }

    // Process each survey to fetch links and update the database
    const updatedSurveys = await Promise.all(
      surveys.map(async (survey) => {
        const surveyData = survey.toJSON();
        
        // Fetch livelink and testlink from external API
        const { livelink, testlink } = await fetchLinksFromLucid(surveyData.survey_id);

        // Update survey in the database
        await ResearchSurvey.update(
          {
            livelink,
            testlink
          },
          {
            where: {
              survey_id: surveyData.survey_id
            }
          }
        );

        return {
          survey_id: surveyData.survey_id,
          livelink,
          testlink
        };
      })
    );

    res.json({ 
      status: "success", 
      updatedSurveys,
      count: updatedSurveys.length
    });
  } catch (error) {
    console.error("Error processing surveys:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Internal server error",
      error: error.message 
    });
  }
});
app.get("/ad", async (req, res) => {
  try {
    const rest = await UQualification.findAll({
      attributes: { exclude: ["id"] },
      where: {
        country_language_code: "ENG-US",
      },
    });
    res.status(200).json(rest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const associate = async (value, score, survey_qualifications,survey_id,earnings_per_click,livelink) => {
  let marks = 0; 
  survey_qualifications.forEach((item) => {
    const question_id = item.question_id;
    const precodes = item.precodes;


    if (question_id in score ){
      if (precodes.includes(String(score[question_id]))){
        marks += 1
        // console.log(marks)
      }
    }
  });

  if (marks > 0) {
    value["survey_id"] = survey_id;
    value["score"] = marks;
    value["earnings_per_click"] = earnings_per_click
    value["livelink"] = livelink
  }

  return value;
};

const axios = require("axios");
const { literal } = require("sequelize");

const enhanceDataWithAI = async (originalData) => {
  try {
    
    const enhancedPrompt = generateAIPrompt(originalData);
    console.log("Sending data to Gemini API for enhancement...");

    // Call the Gemini API
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCcr8sTqsAvkBSTpCOZMUTZubBiuAJe1BQ",
      {
        contents: [{ parts: [{ text: enhancedPrompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = aiResponse?.match(/\[[\s\S]*\]/);
  
    if ("jsonMatch") {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Invalid AI response format");
    }
  } catch (error) {
    console.error("AI enhancement failed, using original data:", error);
    return originalData;
  }
};

// Generate a prompt for Gemini API
const generateAIPrompt = (originalData) => {
  return `
  As an expert survey designer, please clean and enhance the following survey data. 
    Follow these rules:
    1. Fix any malformed text or quotes
    
    2. Standardize question formatting
    3. Make answer options more clear and consistent
    4. Preserve all original Question_IDs and precode values
    5. Maintain the exact same data structure
    6. Keep all existing options but improve their text clarity
    7. Keep a question professional looking and make it in atleast 49 words
    8. Hispanic answer wer incomplete 
    No , not of Hispanic, Latino, or Spanish origin	1


    Original survey data:
    ${JSON.stringify(originalData, null, 2)}

    Please return the enhanced data in exactly the same JSON structure with the same fields (Question, Question_ID, Options array with answer and precode fields).
  `;
};

app.get("/val", async (req, res) => {
  try {
    // Fetch question usage data
    const questionUsage = await ResearchSurveyQualification.findAll({
      attributes: [
        "question_id",
        [Sequelize.fn("COUNT", Sequelize.col("question_id")), "usage_count"],
        "survey_id",
      ],
      group: ["question_id"],
      order: [
        [Sequelize.fn("COUNT", Sequelize.col("question_id")), "DESC"],
        ["createdAt", "DESC"],
        ["updatedAt", "DESC"],
      ],
      limit: 10,
    });

    const arr = [];

    // Process each question usage data
    for (const item of questionUsage) {
      const questionData = await UQualification.findAll({
        attributes: { exclude: ["id"] },
        where: { question_id: item.question_id , country_language : 9},
      });
      // console.log(questionData)

      // Function to process the fetched survey data
      const processedSurvey = (surveyData) => {
        const questionMap = {};

        // Group answers by question_id
        surveyData.forEach((entry) => {
          const {
            question_id,
            question,
            type,
            answer,
            precode,
            country_language,
            country_language_code,
          } = entry;

          if (!questionMap[question_id]) {
            questionMap[question_id] = {
              Question: question,
              Question_ID: question_id,
              Type: type,
              country_language,
              country_language_code,
              Options: [],
            };
          }

          // Add the answer to the options list
          questionMap[question_id].Options.push({
            answer: answer.trim(),
            precode: precode.toString(),
          });
        });

        return Object.values(questionMap);
      };

      // Push processed data into the array
      arr.push(...processedSurvey(questionData));
      // console.log(arr)
    }

    // console.log(arr);
    // const enhancedData = enhanceDataWithAI(arr)
    res.status(200).json(arr);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const fs = require('fs'); 

app.post("/getResearchSurveys", async (req, res) => {
  try {
    const { score } = req.body;
    let arr = [];
    for (const key in score) {
      arr.push(Number(key)); // Convert keys to numbers and store them in arr
    }
    const scoreList = arr.join(',');
    console.log(scoreList) // Create a comma-separated string of scores

    const surveys = await ResearchSurvey.findAll({
      where: {
        is_live: 1,
        message_reason: { [Op.ne]: "deactivated" }
      },
      attributes: [
        "survey_id",
        "earnings_per_click",
        "conversion",
        "livelink",
        "testlink",
      ],
      include: [
        {
          model: ResearchSurveyQualification,
          as: "survey_qualifications",
          attributes: ["question_id", "precodes"],
          where: {
            question_id: {
              [Op.in]: arr, // Use the array here
            },
          },
          required: false,
        },
      ],

      limit: 10000,
      order: [
        ["earnings_per_click", "DESC"],
        ["conversion", "DESC"],
      ],
    });
    console.log(surveys);

    let result = [];
    for (const item of surveys) {
      let value = {};
      await associate(value, score, item.survey_qualifications, item.survey_id, item.earnings_per_click, item.livelink);
      if (Object.keys(value).length) result.push(value);
    }

    // Save the result in a JSON file
    const filePath = './survey.json';  // Define the file path
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');  // Write data to file

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// app.post("/v", async(req,res) => {
//   const data = req.body ;
//   console.log(req.body)
//   const info = await SupplyInfo.findOne({id : data.id})
//   const a = info.update(data)
//   res.status(200).json(a)
app.post("/demo/create", UserInfo.demoCreate)
app.get("/get/demo/prescreen/:id", UserInfo.prescreenAvailable)
app.get("/get/demo/survey/:id", UserInfo.getDemoSurvey)
app.post("/devicedata/", deviceDetail.getDeviceData);
app.get("/compaign/", surveyDetailController.redirectIndividual)
app.get("/compaign/live", surveyDetailController.redirectIndividualCompaign)
app.get("/0001012/", surveyDetailController.redirectUser)

 app.use("/api/v1/survey", surveyRoutes);
 app.use("/api/v2/survey", detailRoutes);
 
app.post('/call', Hook.createSurvey)
app.get("/:status", surveyDetailController.buyerData)
app.post("/supply/create", SupplyAuth.SupplierCreate);
app.post("/api/create", Auth.BuyerCreate);

module.exports = app;
                                     
