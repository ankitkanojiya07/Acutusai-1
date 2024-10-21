const express = require("express");
const router = express.Router();
const surveyDetail = require("../controllers/Supplier/SupplierData");
const surveyGetController = require("../controllers/Supplier/SupplierGetSurvey");
const surveyDetailController = require("../controllers/Supplier/SupplierDetail");
const surveyPriceController = require("../controllers/Supplier/SupplierPriceCard");

 // Fixed the typo
const Supply = require("../models/supplyModels"); 

const SupplyAuthChecker = async (req, res, next) => {
    console.log(req.headers);
    const ApiKey = req.headers["authorization"];
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
router.get("/:id", surveyDetailController.fetchSurvey);
router.get(
    "/detail/:id",
    SupplyAuthChecker,
    surveyDetailController.getAllSurveysDetail
);
router.get("/detaillive/:id", surveyDetailController.getDetail);

// router.get("/live", SupplyAuthChecker, surveyGetController.);
router.get("/", SupplyAuthChecker, surveyGetController.getLiveSurveys);
router.get(
    "/finished",
    SupplyAuthChecker,
    surveyGetController.getFinishedSurveys
);
router.get(
    "/price",
    surveyPriceController.priceChart
);
router.post("/cookies/:id", surveyDetailController.CookiesDetail)
router.get("/redirect/:sid",  surveyDetailController.redirectUser);
router.get(
    "/link/:id",
    SupplyAuthChecker,
    surveyDetailController.getSurveyLink
);
router.get(
    "/quota/:id",
    SupplyAuthChecker,
    surveyDetailController.getSurveyQuota
);
router.post("/service", SupplyAuthChecker, surveyDetailController.buyerData);
router.get(
    "/qualification/:id",
    SupplyAuthChecker,
    surveyDetailController.getSurveyQualification
);

router.get("/reporting/:id", surveyDetailController.detail)
router.get("/complete/:id", surveyDetailController.Complete )

module.exports = router;
