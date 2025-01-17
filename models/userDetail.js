const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config'); // Import sequelize instance from config.js

const UserDetail = sequelize.define(
  'UserDetail',
  {
    firebaseInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    identities: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    idToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    network: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    sessionInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: 'user_details',
    timestamps: false,
  }
);

module.exports = UserDetail;
