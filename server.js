const sequelize = require("./config");
const app = require("./app");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Database synced successfully!");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {

    console.error("Error syncing database:", err);
  }
})();          
