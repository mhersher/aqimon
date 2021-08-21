module.exports = (sequelize, Sequelize) => {
  var Subscription = sequelize.define('subscription', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    device_id: {
      type: Sequelize.INTEGER(5).UNSIGNED,
      foreignKey: {
        allowNull: false
      }
    },
    user_email: {
      type: Sequelize.STRING(),
      foreignKey: {
        allowNull: false
      }
    },
    //The type of measurement to alert on - pm2.5 aqi, pm10 aqi, temp, humidity
    metric: {
      type: Sequelize.STRING(10)
    },
    increasing: {
      type: Sequelize.BOOLEAN
    },
    threshold: {
      type: Sequelize.INTEGER(3).UNSIGNED
    },
    decreasing: {
      type: Sequelize.BOOLEAN
    }
  },{underscored: true});

  return Subscription;
};
