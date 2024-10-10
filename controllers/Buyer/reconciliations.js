const { where } = require("sequelize");
const sequelize = require("../../config");
const { Survey, Condition, Quotas } = require("../../models/association");
const Recon = require("../../models/reconcilliation");

exports.reconcillation = async (req, res) => {
    try {
        const { id } = req.params;
        const apikey = req.headers['authorization'];

        // Validate that apikey is present
        if (!apikey) {
            return res.status(400).json({ message: "API key is required" });
        }

        const { UserID } = req.body;

        // Check if UserID is an array and convert it to a string if needed
        if (Array.isArray(UserID)) {
            // Join array elements into a comma-separated string
            UserID = UserID.join(',');
        } else if (typeof UserID !== 'string') {
            return res.status(400).json({ message: "UserID must be a string or an array" });
        }

        const result = await Recon.create({
            Apikey: apikey,
            SurveyID: id,
            UserID: UserID,
        });

        if (result) {
            return res.status(200).json(result);
        } else {
            return res.status(404).json({ message: "Record not found" });
        }

    } catch (err) {
        console.error(err);
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
