const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config");

const UserEmail = sequelize.define(
  "UserEmail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true, // first name is optional
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true, // last name is optional
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // email is compulsory
      unique: true, // email should be unique
    },
  },
  {
    timestamps: true,
  }
);

module.exports = UserEmail;
