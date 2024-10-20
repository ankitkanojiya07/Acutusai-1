const { where } = require("sequelize");
const sequelize = require("../../config");
const RateCard = require("../../models/SupplierRateCard");

exports.priceChart = async (req, res) => {
  try {
    const { LOI, IR, SupplyID, AccountID } = req.body;
    
    // Await the findOne method
    const rateCard = await RateCard.findOne({
      where: {
        IR: LOI,  // Make sure this is intended
        SupplyID: SupplyID,
      },
    });

    // Log the result or a specific property
    if (rateCard) {
      console.log(rateCard); // Log the entire result or specific property if needed
    } else {
      console.log('No rate card found');
    }
    
    res.status(200).json({
        "CPI" : rateCard.get(IR)
    }
    ); // Send response back
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
};
