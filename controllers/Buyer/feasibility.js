const { where } = require("sequelize");
const sequelize = require("../../config");
// const Tier1 = require("../../models/tier1Models");
// const Tier2 = require("../../models/tier2Models");
// const Tier3 = require("../../models/tier3Models");
// const Tier4 = require("../../models/tier4Models");
const BuyerInfo = require("../../models/buyerInfoModels");
// const Tier5 = require("../../models/tier5Models");
// const Tier6 = require("../../models/tier6Models");
const Buyer = require("../../models/BuyerModels");

function generateSecretKey(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secretKey = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      secretKey += characters[randomIndex];
  }
  return secretKey;
}

async function getTierPrice(req, res) {
  try {
    const { LOI, IR, Country } = req.body;
    const { authorization } = req.headers;

    const tier1 = ["USA", "UK"];
    const tier2 = ["France", "Germany", "Italy", "Spain", "Brazil"];
    const tier3 = [
      "South Korea",
      "Argentina",
      "Vietnam",
      "Malaysia",
      "Philippines",
      "Singapore",
      "Thailand",
      "Poland",
      "South Africa",
      "Ireland",
      "NL",
      "Taiwan",
      "Belgium",
      "Sweden",
    ];
    const tier4 = ["Denmark", "Finland", "Norway", "Colombia", "Switzerland"];
    const tier5 = [
      "Middle East",
      "Hungary",
      "Ukraine",
      "Romania",
      "Cz Republic",
      "Greece",
    ];
    const tier6 = [
      "India",
      "Mexico",
      "China",
      "Japan",
      "Australia",
      "Turkey",
      "Russia",
    ];

    if (!LOI || !IR || !Country) {
      return res
        .status(400)
        .json({ error: "LOI, IR, and Country are all required" });
    }

    // Create the BuyerInfo entry and store FID
    const buyerInfo = await BuyerInfo.create({
      IR,
      LOI,
      ApiKey: authorization,
      Country: Country,
      FID: generateSecretKey(8),
    });

    // Extract FID from the newly created BuyerInfo
    const FID = buyerInfo.FID;

    // Determine the tier based on the country
    let selectedTierModel;
    if (tier1.includes(Country)) {
      selectedTierModel = Tier1;
    } else if (tier2.includes(Country)) {
      selectedTierModel = Tier2;
    } else if (tier3.includes(Country)) {
      selectedTierModel = Tier3;
    } else if (tier4.includes(Country)) {
      selectedTierModel = Tier4;
    } else if (tier5.includes(Country)) {
      selectedTierModel = Tier5;
    } else if (tier6.includes(Country)) {
      selectedTierModel = Tier6;
    } else {
      return res.status(404).json({ error: "Country not found in any tier" });
    }

    // Find the row with the matching LOI
    const tierData = await selectedTierModel.findOne({
      where: { IR: LOI },
    });

    if (!tierData) {
      return res.status(404).json({ error: "No data found for the given LOI" });
    }

    // Get the price for the specified IR
    const price = tierData.get(IR);

    if (!price) {
      return res.status(404).json({ error: "No price found for the given IR" });
    }

    // Remove the '$' sign and convert to a number
    const numericPrice = parseFloat(price.replace("$", ""));

    // Return the response with the FID
    return res.json({ LOI, IR, Country, CPI: numericPrice, FID });
  } catch (error) {
    console.error("Error in getTierPrice:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getTierPrice,
};
