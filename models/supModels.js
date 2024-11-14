const { DataTypes } = require("sequelize");
const sequelize = require("../config"); 

const SupplyInfo = sequelize.define("SupplyInfo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SessionID : {
    type : DataTypes.STRING,
    allowNull : true
  },
  SupplyID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  SurveyID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  UserID: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  TokenID: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true
});

module.exports = SupplyInfo;
