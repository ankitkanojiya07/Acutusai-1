// Import necessary Sequelize components
const { DataTypes } = require("sequelize");
const sequelize = require("../config"); // Import the Sequelize instance configured in the config file

// Define the 'Survey' model with attributes 'Code' and 'Name'
const IndustryType = sequelize.define("Survey", {
  // Define the 'Code' field as a string that cannot be null
  Code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Define the 'Name' field as a string that cannot be null
  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Export the IndustryType model for use in other parts of the application
module.exports = IndustryType;
