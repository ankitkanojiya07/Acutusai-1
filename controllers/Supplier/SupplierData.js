const SupplyInfo = require('../../models/supModels');
const sequelize = require("../../config");
const { where } = require('sequelize');



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
