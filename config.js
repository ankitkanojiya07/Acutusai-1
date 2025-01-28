const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('acutusdb', 'acutusdbadmin', 'THJuOs3i9i2FA7z', {
  host: 'acutus-db.c9q6ec2iwrfk.ap-south-1.rds.amazonaws.com', 
  port: 3306,        
  dialect: 'mysql',
  pool: {
    max: 100,                  
    min: 4,                   
    acquire: 10000,           
    idle: 5000               
  },
  logging: false,           
  benchmark: true,         
  define: {
    timestamps: true,    
  },
  poolLogging: true 
});

module.exports = sequelize;
