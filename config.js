const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('u411184336_acutusaidb', 'u411184336_acutusaidb', 'AcutusaiDb111', {
  host: '193.203.184.105', 
  port: 3306,        
  dialect: 'mysql',
  pool: {
    max: 150,           // Adjust based on traffic
    min: 10,
    acquire: 30000,     // Wait time to acquire a connection
    idle: 10000,        // Time before closing idle connections
    evict: 15000        // Check idle connections every 15 seconds
  },
});

module.exports = sequelize;
