const { where } = require("sequelize");
const sequelize = require("../../config");
const { Survey, Condition, Quotas } = require("../../models/association");
const Rec = require("../../models/reconcilliation");

exports.reconciliation = async (req, res) => {
    try {
        const { SurveyId } = req.params;
        const apiKey = req.headers['authorization'];

        // Check if API key is provided
        if (!apiKey) {
            return res.status(400).json({ message: "API key is required" });
        }

        const { UserID } = req.body;

        // Update the survey status to "Complete"
        const updatedSurvey = await Survey.update(
            { status: "Complete" },
            { where: { id: SurveyId } }
        );

        if (!updatedSurvey[0]) {
            return res.status(404).json({ message: "Survey not found" });
        }

        // Ensure UserID is a string, convert from array if necessary
        let userIdString = UserID;
        if (Array.isArray(UserID)) {
            userIdString = UserID.join(',');
        } else if (typeof UserID !== 'string') {
            return res.status(400).json({ message: "UserID must be a string or an array" });
        }

        // Create a record in the Rec table
        await Rec.create({
            SurveyID: SurveyId,
            UserID: userIdString,
            ApiKey: apiKey
        });

        res.status(200).json({ message: "Survey status updated and record created successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.feasibility = async (req, res) => {
    try {
        const { LOI, IR, CountryLanguageID, CPI } = req.body;

        if (!LOI || !IR || !CountryLanguageID || !CPI) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await Survey.update(
            {
                LOI: LOI,
                IR: IR,
                CountryLanguageID: CountryLanguageID,
                CPI: CPI
            },
            {
                where: {
                    id: req.params.id
                }
            }
        );

        return res.status(200).json({
            message: "Request successful",
            data: result
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
