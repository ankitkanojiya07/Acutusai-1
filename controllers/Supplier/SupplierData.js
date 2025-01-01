const SupplyInfo = require('../../models/supModels');
const UserEmail = require('../../models/UserEmail') ;
const { ResearchSurvey, ResearchSurveyQuota, ResearchSurveyQualification } = require('../../models/uniqueSurvey');
const sequelize = require("../../config");
const { where } = require('sequelize');
exports.getSurveyOpiniomea = async (req, res) => {
    try {
      const survey = await ResearchSurvey.findAll({
        where: {
          s_live: 1,
          message_reason: { [Op.ne]: "deactivated" },
          livelink: { [Op.ne]: "" },

        },
        limit: 10,
      });
  
      // Check if surveys exist
      if (survey.length === 0) {
        return res.status(404).json({ message: "No surveys found" });
      }
  
      // Respond with survey data
      res.status(200).json(survey);
    } catch (err) {
      console.error("Error fetching surveys:", err.message);
  
      // Respond with error status and message
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  };
  
const UserInfo = async (req, res) => {
    try {
        const { name, email,panelistId } = req.body; // Destructuring the body
        // Ensure all required fields are provided and valid
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Create a new entry in the UserEmail model
        const user = await UserEmail.create({
            name,
            email,
            panelistId
        });

        // Return success response
        return res.status(201).json({
            message: "User email created successfully",
            user,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "An error occurred while creating the user" });
    }
};

const sendSupplyData = async (req, res) => {
    try {
        const { id } = req.params; // Extract surveyId from request params
        console.log(id)
        
        const supply = await SupplyInfo.findAll({
            where: {
                surveyID: id // Find supply data based on surveyId
            }
        }); 
        
        if (supply) {
            res.status(200).json(supply); // Send the found supply data
        } else {
            res.status(404).json({ error: 'Supply data not found for the given surveyId.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching supply data.' });
    }
};

const sendCompData = async(req, res) => {
    try{
        const { id } = req.params;
        const Comp = SupplyInfo.findAll({
            where : {
                status : "comp"
            }
        })

        if (Comp) {
            res.status(200).json(Comp); // Send the found supply data
        } else {
            res.status(404).json({ error: 'Supply data not found for the given surveyId.' });
        }

    }catch(err){
        console.log(err) ;

    }
}

const sendTermData = async(req, res) => {
    try{
        const { id } = req.params;
        const Term = SupplyInfo.findAll({
            where : {
                status : "term"
            }
        })

        if (Term) {
            res.status(200).json(Comp); // Send the found supply data
        } else {
            res.status(404).json({ error: 'Supply data not found for the given surveyId.' });
        }

    }catch(err){
console.log(err) ;
    }
}


module.exports = { sendSupplyData, sendCompData, sendTermData, UserInfo };
