const OpenAI = require("openai");
const UserInfo = require("../../models/userbuyer") ;
require('dotenv').config(); 



const openai = new OpenAI({
  apiKey: process.env.API_KEY, 
});

async function generatePrescreen(keyword) {
  try {
    console.log(process.env.API_KEY) ;
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `You are an advanced prescreening question generator. Your task is to create a detailed and well-structured JSON-formatted prescreening questionnaire based on the given keyword. Ensure all instructions are followed accurately.

Key Requirements:
- Generate 3-5 precise and keyword-relevant questions.
- Each question must include:
  * A unique 'question_id'.
  * A clear and concise 'question_text'.
  * A 'response_options' array containing multiple choices (avoid yes/no unless essential).
    * For questions involving demographics like age, gender, or income level:
      - Use well-defined ranges for age (e.g., 18-24, 25-34, 35-44).
      - Ensure gender options are inclusive (e.g., Male, Female, Non-binary, Prefer not to say).
      - Include varied income ranges if relevant (e.g., Less than $20,000, $20,000-$50,000, $50,000-$100,000).
    * Prioritize single-choice questions for categorical data.
  * Each option in 'response_options' must include:
    * 'option_text': Descriptive text for the response option.
    * 'qualifies': A boolean flag indicating whether this response qualifies the respondent.
- Avoid binary yes/no responses unless specifically required by the keyword.

- Include a 'qualification_criteria' section:
  * This summarizes the overall logic to determine whether a respondent qualifies based on their responses.
  * Must clearly outline the conditions for qualification.

- Ensure all JSON is formatted correctly, with no unnecessary spaces or line breaks.

JSON Structure Example:
{
  "prescreening_questions": [
    {
      "question_id": 1,
      "question_text": "Sample question?",
      "response_options": [
        { "option_text": "Option 1", "qualifies": false },
        { "option_text": "Option 2", "qualifies": true },
        { "option_text": "Option 3", "qualifies": true }
      ]
    }
  ],
  "qualification_criteria": [
    {
      "criteria": "Explanation of criteria",
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
  response_format: { type: "json_object" }, // Ensures JSON output
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
    console.log(resp);
    const record = resp[0].dataValues;


    const qualifications = JSON.parse(record.qualifications || "[]");
    console.log(qualifications);
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



