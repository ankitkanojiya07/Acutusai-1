const express = require('express');
const router = express.Router();
const surveyCreateController = require('../controllers/Buyer/SurveyBuyerControllerCreate');
const surveyUpdateController = require('../controllers/Buyer/SurveyBuyerUpdateModels');
const Buyer = require('../models/BuyerModels');
const Recon = require("../controllers/Buyer/reconciliations");
const Feasibility = require("../controllers/Buyer/feasibility")
// const tier1 = require("../models/tier1Models")
// const tier2 = require("../models/tier2Models")
// const tier3 = require("../models/tier3Models")
// const tier4 = require("../models/tier4Models")
// const tier5 = require("../models/tier5Models")


const BuyerAuthChecker = async (req, res, next) => {
    console.log(req.headers);
    const  ApiKey  = req.headers['authorization'];
    console.log(ApiKey);
    try {
        const BuyerData = await Buyer.findOne({ where: { ApiKey } });
        if (BuyerData) {
            next(); 
        } else {
            res.status(401).json({ message: "Unauthenticated" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

router.post('/create', BuyerAuthChecker, surveyCreateController.surveyCreate);
router.put('/update/:id', BuyerAuthChecker, surveyUpdateController.updateSurvey);
router.post('/reconcillation/:id', BuyerAuthChecker, Recon.reconcillation);
router.get('/feasibility', Feasibility.getTierPrice);

module.exports = router;
