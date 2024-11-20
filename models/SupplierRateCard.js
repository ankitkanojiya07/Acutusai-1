const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const RateCard = sequelize.define('RateCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rateCardName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const RateEntry = sequelize.define('RateEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rateCardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'RateCards',
      key: 'id',
    },
  },
  irMin: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  irMax: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  loiMin: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  loiMax: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Associations
RateCard.hasMany(RateEntry, {
  foreignKey: 'rateCardId',
  as: 'entries',
});

RateEntry.belongsTo(RateCard, {
  foreignKey: 'rateCardId',
  as: 'rateCard',
});

module.exports = { RateCard, RateEntry };
