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
const SupplyInfo = require("./models/supModels")
const UQualification = require("./models/USQualification")
console.log(process.memoryUsage());

app.use(cors());
app.set("trust proxy", true);
// app.use(express.json());
app.use(bodyParser({limit: '50mb'}));
//app.use(express.bodyParser({limit: '50mb'}));
// app.use(express.urlencoded({ limit: '500mb', extended: true }));
//app.use(bodyParser.json({ limit: 500*1024*1024, extended: true }));
//app.use(bodyParser.urlencoded({ limit: 500*1024*1024, extended: true }));

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

// const associate = async (value, score, survey_qualifications,survey_id,earnings_per_click) => {
//   let marks = 0; 

//   survey_qualifications.forEach((item) => {
//     const question_id = item.question_id;
//     const precodes = item.precodes;


//     if (question_id in score ){
//       if (precodes.includes(String(score[question_id]))){
//         marks += 1

//       }
//     }
//   });

//   // If marks are found, assign to value
//   if (marks > 0) {
//     value["survey_id"] = survey_id;
//     value["score"] = marks;
//     value["earnings_per_click"] = earnings_per_click
//   }

//   return value;
// };

// const axios = require("axios");
// const { literal } = require("sequelize");

// Function to enhance survey data with Gemini AI
const associate = async (value, score, survey_qualifications,survey_id,earnings_per_click,livelink) => {
  let marks = 0; 
  // console.log(value, score, survey_qualifications,survey_id,earnings_per_click,livelink)
// 
  survey_qualifications.forEach((item) => {
    const question_id = item.question_id;
    const precodes = item.precodes;


    if (question_id in score ){
      if (precodes.includes(String(score[question_id]))){
        marks += 1
        console.log(marks)
      }
    }
  });

  // If marks are found, assign to value
  if (marks > 0) {
    value["survey_id"] = survey_id;
    value["score"] = marks;
    value["earnings_per_click"] = earnings_per_click
    value["livelink"] = livelink
  }

  // console.log("value  is ", value)

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

    // console.log(response.data?.candidates?.[0]?.content?.parts?.[0]?.text);

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


    Original survey data:
    ${JSON.stringify(originalData, null, 2)}

    Please return the enhanced data in exactly the same JSON structure with the same fields (Question, Question_ID, Options array with answer and precode fields).
  `;
};

// `/val` endpoint to fetch and enhance survey questions
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
      console.log(questionData)

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
      console.log(arr)
    }

    console.log(arr);
    // const enhancedData = enhanceDataWithAI(arr)
    res.status(200).json(arr);
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
      arr.push(Number(key)); // Convert keys to numbers and store them in arr
    }
    const scoreList = arr.join(',');
    // console.log(scoreList) // Create a comma-separated string of scores

    const surveys = await ResearchSurvey.findAll({
      where: {
        is_live: 1,
        message_reason: { [Op.ne]: "deactivated" },
        livelink : { [Op.ne] : null }
      },
      attributes: [
        "survey_id",
        "earnings_per_click",
        "conversion",
        "livelink",
        "testlink",
        // [
        //   literal(`(
        //     SELECT COUNT(DISTINCT sq.question_id)
        //     FROM research_survey_qualifications AS sq
        //     WHERE sq.survey_id = "ResearchSurvey"."survey_id"
        //     AND sq.question_id IN (${scoreList})
        //   )`),
        //   'matching_questions_count'
        // ]
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
      // having: literal(`matching_questions_count = ${arr.length}`),
      // group: ['ResearchSurvey.survey_id', 'survey_qualifications.survey_id', 'survey_qualifications.question_id'],
      limit: 10000,
      order: [
        ["earnings_per_click", "DESC"],
        ["conversion", "DESC"],
      ],
    });
    console.log(surveys)

    let result = [];
    for (const item of surveys) {
      let value = {};
      await associate(value, score, item.survey_qualifications, item.survey_id, item.earnings_per_click, item.livelink);
      if (Object.keys(value).length) result.push(value);
    }

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
// })
app.get("/0001012/",
 surveyDetailController.redirectUser)

app.post('/call', Hook.createSurvey)
app.get("/:status", surveyDetailController.buyerData)
app.post("/supply/create", SupplyAuth.SupplierCreate);
app.post("/api/create", Auth.BuyerCreate);
app.use("/api/v1/survey", surveyRoutes);
app.use("/api/v2/survey", detailRoutes);

module.exports = app;
                                     
