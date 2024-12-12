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
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: `You are a prescreening questionnaire generator. Your task is to create a highly targeted JSON-formatted prescreening questionnaire based on a given keyword. Follow these instructions closely:

### Requirements for the Questionnaire:
1. **Number of Questions**:
   - Generate 3-5 precise, relevant, and engaging questions related to the keyword.

2. **Structure of Each Question**:
   - **question_id**: A unique numeric ID for each question.
   - **question_text**: A concise, clear question.
   - **response_options**: An array of multiple-choice responses.
     - Avoid yes/no responses unless absolutely necessary.
     - Responses must include diverse, context-appropriate options (e.g., age ranges, categories, behaviors).
     - Each response must have:
       - **option_text**: The text for the response.
       - **qualifies**: A boolean indicating whether the response qualifies the respondent.

3. **Qualification Criteria**:
   - Include an overarching **qualification_criteria** section summarizing how responses determine if a participant qualifies.
   - Clearly describe the logical conditions (e.g., specific combinations of answers or thresholds).

4. **Formatting**:
   - Output must be in valid JSON format, without extra spaces or line breaks.
   - Ensure strict adherence to the following schema:

### JSON Schema Example:
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
      "criteria": "Description of qualification logic",
      "qualifies": true
    }
  ]
}

### Additional Notes:
- Questions must be tailored to the keyword and meaningful to the context.
- Avoid redundant or ambiguous questions.
- Binary yes/no questions should only be used if essential to the keyword.
- Prioritize single-choice questions with multiple response options for demographics like gender or age.
`
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



