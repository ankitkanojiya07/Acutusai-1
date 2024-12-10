const OpenAI = require("openai");
const UserInfo = require("../../models/userbuyer") ;
require('dotenv').config(); 

console.log(process.env.API_KEY)

const openai = new OpenAI({
  apiKey: process.env.API_KEY, 
});

async function generatePrescreen(keyword) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        {
          role: "system",
          content: `You are an advanced prescreening question generator. Your task is to create a comprehensive and precise JSON-formatted prescreening questionnaire based on the given keyword.

      Key Requirements:
      - Generate 3-5 targeted questions
      - Each question must have:
        * Unique question_id
        * Clear question_text
        * Multiple response_options
        * Boolean 'qualifies' flag for each option
      - Include an overall qualification_criteria section
      - Ensure questions are relevant to the keyword
      - Format must be exact JSON with no spaces between braces/keys
      
      Example Structure:
      {"prescreening_questions":[
        {
          "question_id":1,
          "question_text":"What is your relevant experience?",
          "response_options":[
            {"option_text":"0-2 years","qualifies":false},
            {"option_text":"3-5 years","qualifies":true},
            {"option_text":"6-10 years","qualifies":true},
            {"option_text":"10+ years","qualifies":true}
          ]
        }
      ],
      "qualification_criteria":[
        {"experience":"3+ years","qualifies":true}
      ]}`
        },
        {
          role: "user",
          content: keyword
        }
      ],
      response_format: { type: "json_object" }, // Ensures JSON output
      max_tokens: 500,
      temperature: 0.7,
    });

    const prescreenData = JSON.parse(completion.choices[0].message.content);
    console.log(JSON.stringify(prescreenData, null, 2));
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
exports.prescreenAvailable = async (req, res) => {
  try {
    const { id } = req.params; 
    const resp = await UserInfo.findAll({
      where: {
        id, 
      },
    });

    if (resp.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    const qualifications = resp.qualifications || []; 
    // if (!Array.isArray(qualifications)) {
    //   return res.status(400).json({ message: "Invalid qualifications format" });
    // }

    let prescreenInput = "Please answer the following questions: \n";
      qualifications.forEach((qual) => {
        Object.entries(qual).forEach(([key, value]) => {
          prescreenInput += `Q: ${key}, A: ${value}\n`;
        });
    });
    console.log(prescreenInput) ;

    generatePrescreen(prescreenInput)
      .then((data) => {
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



