const SupplyInfo = require('../../models/supModels');
const UserEmail = require('../../models/UserEmail') ;
const sequelize = require("../../config");
const { where } = require('sequelize');

const UserInfo = async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body; // Destructuring the body
        // Ensure all required fields are provided and valid
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Create a new entry in the UserEmail model
        const user = await UserEmail.create({
            firstName,
            lastName,
            email,
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

    }
}


module.exports = { sendSupplyData, sendCompData, sendTermData };
