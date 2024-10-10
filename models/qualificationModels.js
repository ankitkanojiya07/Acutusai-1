const { DataTypes } = require("sequelize");
const sequelize = route("./config");

const Qualification = sequelize.define("Qualification", {
  Age: {
    type: DataTypes.INTEGER,
  },
  Education: {
    type: DataTypes.STRING,
  },
  Experience: {
    type: DataTypes.STRING,
  },
  Gender: {
    type: DataTypes.STRING,
  },
  Country: {
    type: DataTypes.STRING,
  },
  State: {
    type: DataTypes.STRING,
  },
});

module.exports = Qualification;
