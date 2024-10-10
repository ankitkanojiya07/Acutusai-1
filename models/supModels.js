const { DataTypes } = require("sequelize");
const sequelize = require("../config"); 
const SupplyInfo = sequelize.define("SupplyInfo", {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SupplyID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  SurveyID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  UserID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  TokenID: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status : {
    type : DataTypes.STRING,
    allowNull : true
  }

});

module.exports = SupplyInfo;
