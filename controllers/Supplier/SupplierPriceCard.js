const { where } = require("sequelize");
const sequelize = require("../../config");
const {RateCard ,RateEntry}= require("../../models/SupplierRateCard");
const { Op } = require("sequelize");
exports.getRateCard = async (req, res) => {
  try {
    const { id } = req.params;

    const rateCard = await RateCard.findOne({
      where: { id },
      include: [
        {
          model: RateEntry,
          as: 'entries',
        },
      ],
    });

    if (!rateCard) {
      return res.status(404).json({ message: 'Rate card not found' });
    }

    res.status(200).json(rateCard);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching rate card' });
  }
};

exports.createRateCard = async (req, res) => {
  try {
    const { rateCardName, rates } = req.body; // `rates` is an array of rate entries

    const rateCard = await RateCard.create({ rateCardName });

    const rateEntries = rates.map((rate) => ({
      ...rate,
      rateCardId: rateCard.id,
    }));

    await RateEntry.bulkCreate(rateEntries);

    res.status(201).json({ message: 'Rate card created successfully', rateCard });
  } catch (error) {
    res.status(500).json({ error: 'Error creating rate card' });
  }
};

exports.getRate = async (RateCard,LOI,IR) => {
  try {
    console.log("Transfer", RateCard,LOI,IR)

    const rateEntry = await RateEntry.findOne({
      where: {
        rateCardId : RateCard,
        irMin: { [Op.lte]: IR },
        irMax: { [Op.gte]: IR },
        loiMin: { [Op.lte]: LOI },
        loiMax: { [Op.gte]: LOI },
      },
    });
    // console.log(rateEntry.rate)

    if (!rateEntry) {
      return res.status(404).json({ message: 'Rate not found for given and LOI' });
    }

    return rateEntry.rate

  } catch (error) {
    console.error(error)
  }
};
