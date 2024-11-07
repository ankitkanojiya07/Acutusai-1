
const SupplyAuth = require("./Authenication/SupplierCreate");
const surveyRoutes = require("./Authenication/BuyerAuth");
const detailRoutes = require("./Authenication/SupplyAuth");
const Hook = require("./controllers/Buyer/webHook")
console.log(process.memoryUsage());

app.use(cors());
// app.use(express.json());
app.use(bodyParser({limit: '50mb'}));
//app.use(express.bodyParser({limit: '50mb'}));
// app.use(express.urlencoded({ limit: '500mb', extended: true }));
//app.use(bodyParser.json({ limit: 500*1024*1024, extended: true }));
//app.use(bodyParser.urlencoded({ limit: 500*1024*1024, extended: true }));


app.post('/call', Hook.createSurvey)
app.get("/:status", surveyDetailController.buyerData)
app.post("/supply/create", SupplyAuth.SupplierCreate);
app.post("/api/create", Auth.BuyerCreate);
app.use("/api/v1/survey", surveyRoutes);
app.use("/api/v2/survey", detailRoutes);

module.exports = app;
                                     
