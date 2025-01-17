const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config'); // Import sequelize instance from config.js

const UserDetail = sequelize.define(
  'UserDetail',
  {
    firebaseInfo: {
      type: DataTypes.TEXT, // Store JSON as a string
      allowNull: true,
      get() {
        const value = this.getDataValue('firebaseInfo');
        return value ? JSON.parse(value) : null; // Automatically parse when accessing
      },
      set(value) {
        this.setDataValue('firebaseInfo', JSON.stringify(value)); // Automatically stringify when setting
      },
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
      type: DataTypes.TEXT, // Store JSON as a string
      allowNull: false,
      get() {
        const value = this.getDataValue('identities');
        return value ? JSON.parse(value) : null; // Automatically parse when accessing
      },
      set(value) {
        this.setDataValue('identities', JSON.stringify(value)); // Automatically stringify when setting
      },
    },
    idToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    network: {
      type: DataTypes.TEXT, // Store JSON as a string
      allowNull: true,
      get() {
        const value = this.getDataValue('network');
        return value ? JSON.parse(value) : null; // Automatically parse when accessing
      },
      set(value) {
        this.setDataValue('network', JSON.stringify(value)); // Automatically stringify when setting
      },
    },
    deviceInfo: {
      type: DataTypes.TEXT, // Store JSON as a string
      allowNull: true,
      get() {
        const value = this.getDataValue('deviceInfo');
        return value ? JSON.parse(value) : null; // Automatically parse when accessing
      },
      set(value) {
        this.setDataValue('deviceInfo', JSON.stringify(value)); // Automatically stringify when setting
      },
    },
    sessionInfo: {
      type: DataTypes.TEXT, // Store JSON as a string
      allowNull: true,
      get() {
        const value = this.getDataValue('sessionInfo');
        return value ? JSON.parse(value) : null; // Automatically parse when accessing
      },
      set(value) {
        this.setDataValue('sessionInfo', JSON.stringify(value)); // Automatically stringify when setting
      },
    },
  },
  {
    tableName: 'user_details',
    timestamps: false,
  }
);

module.exports = UserDetail;
