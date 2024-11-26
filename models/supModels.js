const { DataTypes } = require("sequelize");
const sequelize = require("../config"); 

const SupplyInfo = sequelize.define("SupplyInfo", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull : null
  
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
  mid : DataTypes.TEXT,
  hash : DataTypes.TEXT,
  UserID: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ClientStatus : {
    type:DataTypes.STRING
  },
  InitialStatus : {
    type:DataTypes.STRING
  },
  TokenID: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  task :DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  IPAddress : {
    type : DataTypes.TEXT
  }
}, {
  timestamps: true
});

module.exports = SupplyInfo;
