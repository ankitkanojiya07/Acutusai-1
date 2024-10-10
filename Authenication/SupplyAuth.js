const express = require('express');
const router = express.Router();
const surveyDetail = require('../controllers/Supplier/SupplierData')
const surveyGetController = require('../controllers/Supplier/SupplierGetSurvey');
const surveyDetailController = require('../controllers/Supplier/SupplierDetail'); // Fixed the typo
const Supply  =  require('../models/supplyModels');

const SupplyAuthChecker = async (req, res, next) => { 
    console.log(req.headers);
    const  ApiKey  = req.headers['authorization'];
    console.log(Supply);
    try {
        const SupplyData = await Supply.findOne({ where: { ApiKey } }); // Fixed variable name
        if (SupplyData) {
            next();
        } else {
            res.status(401).json({ message: "Unauthenticated" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", err });
    }
};    

router.get('/detail/:id', SupplyAuthChecker, surveyDetailController.getAllSurveysDetail)
router.get('/live', SupplyAuthChecker, surveyGetController.getLiveSurveys);
router.get('/', SupplyAuthChecker, surveyGetController.getAllSurveys);
// router.get('/supply/:id',  surveyDetail.sendSupplyData);
// router.get('/statusC/:id', SupplyAuthChecker, surveyDetail.sendCompData);
// router.get('/statusT/:id', SupplyAuthChecker, surveyDetail.sendTermData);
router.get('/finished', SupplyAuthChecker, surveyGetController.getFinishedSurveys); // Fixed function reference
router.get('/redirect', SupplyAuthChecker, surveyDetailController.redirectUser);
router.get('/link/:id', SupplyAuthChecker, surveyDetailController.getSurveyLink);
router.get('/quota/:id', SupplyAuthChecker, surveyDetailController.getSurveyQuota);
router.post('/service', SupplyAuthChecker, surveyDetailController.buyerData);
router.get('/qualification/:id', SupplyAuthChecker, surveyDetailController.getSurveyQualification);

module.exports = router;