const { DataTypes } = require("sequelize");
const sequelize = require("../config"); // Adjust the path as needed

const UserDetail = sequelize.define(
  "UserDetail", // Model name
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firebaseInfo: {
      type: DataTypes.JSONB, // Storing the firebaseInfo object as JSON
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
      type: DataTypes.JSONB, // Storing the identities array as JSON
      allowNull: false,
    },
    idToken: {
      type: DataTypes.TEXT, // For longer JWT tokens
      allowNull: false,
    },
    network: {
      type: DataTypes.JSONB, // Storing network object as JSON
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.JSONB, // Storing deviceInfo object as JSON
      allowNull: true,
    },
    sessionInfo: {
      type: DataTypes.JSONB, // Storing sessionInfo object as JSON
      allowNull: true,
    },
  },
  {
    tableName: "user_details", // Custom table name
    timestamps: false, // Disable Sequelize's automatic timestamps
  }
);

module.exports = UserDetail;
