const OpenAI = require("openai");
const UserInfo = require("../../models/userbuyer");
require('dotenv').config();



const openai = new OpenAI({

  apiKey: process.env.API_KEY,
});

async function generatePrescreen(keyword) {
  try {
    console.log(process.env.API_KEY);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a skilled prescreening questionnaire designer. Your task is to generate a well-structured JSON-formatted questionnaire based on the given keyword, ensuring all questions are meaningful, clear, and non-binary. Follow these key guidelines:
    
    Key Requirements:
    - Generate 2-3 questions related to the provided keyword.
    - Each question must have the following:
      * A unique 'question_id'.
      * A concise, clear 'question_text'.
      * A 'response_options' array containing a list of multiple response choices (avoid yes/no questions).
        * For questions involving demographics (age, gender, income, etc.):
          - Provide well-defined ranges for age (e.g., 18-24, 25-34, etc.).
          - Ensure gender options are inclusive (e.g., Male, Female, Non-binary, Prefer not to say).
          - Use varied income ranges if applicable (e.g., Less than $20,000, $20,000-$50,000, etc.).
        * Prioritize multiple-choice responses with descriptive, non-binary options.
      * Each option in 'response_options' must contain:
        * 'option_text': Descriptive text for the option.
        * 'qualifies': A boolean flag indicating whether this response qualifies the respondent based on predefined criteria.
    - Avoid yes/no answers or any binary responses unless explicitly necessary for the keyword.
    
    - Include a 'qualification_criteria' section:
      * This summarizes the qualification logic, explaining the conditions under which a respondent qualifies.
      * Clearly define what responses are considered qualifying.
    
    Ensure all output is in valid JSON format with no extraneous spaces or line breaks.
    
    JSON Structure Example:
    {
      "prescreening_questions": [
        {
          "question_id": 1,
          "question_text": "Sample question about the topic?",
          "response_options": [
            { "option_text": "Option 1", "qualifies": false },
            { "option_text": "Option 2", "qualifies": true },
            { "option_text": "Option 3", "qualifies": true }
          ]
        }
      ],
      "qualification_criteria": [
        {
          "criteria": "Respondent qualifies if they select option 2 or 3.",
          "qualifies": true
        }
      ]
    }`
        },
        {
          role: "user",
          content: keyword
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7,
    });
    


    const prescreenData = JSON.parse(completion.choices[0].message.content);
    // console.log(JSON.stringify(prescreenData, null, 2));
    return prescreenData;
  } catch (error) {
    console.error("Error generating prescreen:", error.message);
    throw error;
  }
}
exports.demoCreate = async (req, res) => {
  const body = req.body;
  const response = await UserInfo.create({
    ...body
  });
  res.status(200).json(response);
};
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 86400 }); // Cache TTL of 1 day (86400 seconds)

exports.getDemoSurvey = async (req, res) => {
  try {
    const { id } = req.params
    const data = await UserInfo.findOne({
      where: {
        id: id
      }
    })
    res.status(200).json(data)

  } catch (err) {
    console.error(err)
  }
}

exports.prescreenAvailable = async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache for prescreen data
    const cachedData = cache.get(id);
    if (cachedData) {
      console.log("Returning cached data");
      return res.status(200).json({ message: "Prescreen retrieved from cache", data: cachedData });
    }

    // Fetch data from the database
    const resp = await UserInfo.findAll({
      where: {
        id,
      },
    });

    if (resp.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }
    console.log(resp);
    const record = resp[0].dataValues;

    const qualifications = JSON.parse(record.qualifications || "[]");
    console.log(qualifications);

    let prescreenInput = "Please answer the following questions: \n";
    qualifications.forEach((qual) => {
      Object.entries(qual).forEach(([key, value]) => {
        prescreenInput += `Q: ${key}, A: ${value}\n`;
      });
    });
    console.log(prescreenInput);

    generatePrescreen(prescreenInput)
      .then((data) => {
        // Cache the prescreen data for the given ID
        cache.set(id, data);

        res.status(200).json({ message: "Prescreen generated successfully", data });
      })
      .catch((error) => {
        console.error("Prescreen generation failed:", error);
        res.status(500).json({ message: "Prescreen generation failed", error });
      });
  } catch (error) {

    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


