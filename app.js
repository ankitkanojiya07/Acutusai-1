const express = require("express");
const cors = require("cors");
console.log("hsdnas");
const app = express();
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const Question = require("./models/USQualification");
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('./models/uniqueSurvey');
const {
    Survey,
    Condition,
    Quotas,
    Qualification,
  } = require("./models/association");
const bodyParser = require('body-parser');
const surveyDetailController = require("./controllers/Supplier/SupplierDetail");
const Auth = require("./Authenication/BuyerCreate");
const SupplyAuth = require("./Authenication/SupplierCreate");
const surveyRoutes = require("./Authenication/BuyerAuth");
const detailRoutes = require("./Authenication/SupplyAuth");
const Hook = require("./controllers/Buyer/webHook")
console.log(process.memoryUsage());

app.use(cors());
app.set("trust proxy", true);
// app.use(express.json());
app.use(bodyParser({limit: '50mb'}));
//app.use(express.bodyParser({limit: '50mb'}));
// app.use(express.urlencoded({ limit: '500mb', extended: true }));
//app.use(bodyParser.json({ limit: 500*1024*1024, extended: true }));
//app.use(bodyParser.urlencoded({ limit: 500*1024*1024, extended: true }));


const associate = async (value, score, survey_qualifications,survey_id,earnings_per_click) => {
  let marks = 0; 

  survey_qualifications.forEach((item) => {
    const question_id = item.question_id;
    const precodes = item.precodes;


    if (question_id in score ){
      if (precodes.includes(String(score[question_id]))){
        marks += 1

      }
    }
  });

  // If marks are found, assign to value
  if (marks > 0) {
    value["survey_id"] = survey_id;
    value["score"] = marks;
    value["earnings_per_click"] = earnings_per_click
  }

  return value;
};

const axios = require("axios");
const { literal } = require("sequelize");

// Function to enhance survey data with Gemini AI
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

    console.log(response.data?.candidates?.[0]?.content?.parts?.[0]?.text);

    // Extract and parse the AI response
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
      Yes, Mexican, Mexican American, Chicano	2
      Yes, Cuban	3
      Yes, another Hispanic, Latino, or Spanish origin *** Argentina 	4
      Yes, another Hispanic, Latino, or Spanish origin *** Colombia 	5
      Yes, another Hispanic, Latino, or Spanish origin *** Ecuador 	6
      Yes, another Hispanic, Latino, or Spanish origin *** El Salvadore 	7
      Yes, another Hispanic, Latino, or Spanish origin *** Guatemala 	8
      Yes, another Hispanic, Latino, or Spanish origin *** Nicaragua 	9
      Yes, another Hispanic, Latino, or Spanish origin *** Panama 	10
      Yes, another Hispanic, Latino, or Spanish origin *** Peru 	11
      Yes, another Hispanic, Latino, or Spanish origin *** Spain 	12
      Yes, another Hispanic, Latino, or Spanish origin *** Venezuela 	13
      Yes, another Hispanic, Latino, or Spanish origin *** Other Country	14
      Prefer not to answer	15
      Yes, Puerto Rican	16

      can you format them properly in  hispanic

    Original survey data:
    ${JSON.stringify(originalData, null, 2)}

    Please return the enhanced data in exactly the same JSON structure with the same fields (Question, Question_ID, Options array with answer and precode fields).
  `;
};

// `/val` endpoint to fetch and enhance survey questions
app.get("/val", async (req, res) => {
  try {
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

    for (const item of questionUsage) {
      const questionData = await Question.findAll({
        attributes: ["Question", "Answer", "Precodes", "Question_ID", "Type"],
        where: { Question_ID: item.question_id || 42 },
      });

      const processedQuestions = questionData.map((question) => {
        const answers = question.Answer ? question.Answer.split("_") : [];
        const precodes = question.Precodes ? question.Precodes.split("_") : [];

        const answerOptions = answers.map((ans, index) => ({
          answer: ans.trim(),
          precode: precodes[index]?.trim() || "",
        }));

        return {
          Question: question.Question,
          Question_ID: question.Question_ID,
          Options: answerOptions,
          question_type: question.Type,
        };
      });

      arr.push(...processedQuestions);
    }

    // Enhance data with Gemini AI
    const enhancedData = await enhanceDataWithAI(arr);
    console.log(enchancedData);
    res.status(200).json(enhancedData);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/getResearchSurveys", async (req, res) => {
  try {
    const { score } = req.body;
    let arr = [];
    for (const key in score) {
      arr.push(Number(key));
    }
    // Expecting the request body to be parsed correctly

    const surveys = await ResearchSurvey.findAll({
      attributes: ["earnings_per_click", "conversion", "survey_id"],
      include: [
        {
          model: ResearchSurveyQualification,
          as: "survey_qualifications",
          attributes: ["question_id", "precodes"],
          where: {
            question_id: {
              [Op.in]: arr,
            },
          },
          required: true,
        },
      ],
      where: literal(`(
        SELECT COUNT(DISTINCT question_id) 
        FROM research_survey_qualifications AS sq
        WHERE sq.survey_id = ResearchSurvey.survey_id 
        AND sq.question_id IN (42, 43, 96)
      ) = 3`),
      limit: 10000,
      order: [
        ["earnings_per_click", "DESC"],
        ["conversion", "DESC"],
      ],
    });

    let result = [];
    for (const item of surveys) {
      // console.log(item.survey_id);
    //   let val = { survey_id: item.survey_id };
      let value = {};
      await associate(value, score, item.survey_qualifications,item.survey_id,item.earnings_per_click);
      if (Object.keys(value).length) result.push(value);
    }

    console.log(result)

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/0001012/",
 surveyDetailController.redirectUser)

app.post('/call', Hook.createSurvey)
app.get("/:status", surveyDetailController.buyerData)
app.post("/supply/create", SupplyAuth.SupplierCreate);
app.post("/api/create", Auth.BuyerCreate);
app.use("/api/v1/survey", surveyRoutes);
app.use("/api/v2/survey", detailRoutes);

module.exports = app;
                                     
