const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  operatorsAliases: false,

  pool: {
    max: parseInt(process.env.DB_POOL_MAX),
    min: parseInt(process.env.DB_POOL_MIN),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE),
    idle: parseInt(process.env.DB_POOL_IDLE)
  }
});

const db = {};
console.log(process.env)
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.devices = require('./device')(sequelize, Sequelize);
db.samples = require('./sample')(sequelize,Sequelize);
db.devices.hasMany(db.samples)
db.samples.belongsTo(db.devices)
module.exports = db;
