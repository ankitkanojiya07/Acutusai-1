const express = require("express");
const cors = require("cors");
const app = express();
const Auth = require("./Authenication/BuyerCreate");
const SupplyAuth = require("./Authenication/SupplierCreate");
const surveyRoutes = require("./Authenication/BuyerAuth");
const detailRoutes = require("./Authenication/SupplyAuth");

app.use(cors());
app.use(express.json());

app.post("/supply/create", SupplyAuth.SupplierCreate);
app.post("/api/create", Auth.BuyerCreate);
app.use("/api/v1/survey", surveyRoutes);
app.use("/api/v2/survey", detailRoutes);

module.exports = app;
