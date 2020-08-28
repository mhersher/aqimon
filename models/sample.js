module.exports = (sequelize, Sequelize) => {
  var Sample = sequelize.define('sample', {
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
    measurement_time: {
      type: Sequelize.DATE,
      allowNull: false
    },
    pm10aqi: {
      type: Sequelize.INTEGER(5).UNSIGNED
    },
    pm25aqi: {
      type: Sequelize.INTEGER(5).UNSIGNED
    },
    pm10raw: {
      type: Sequelize.FLOAT.UNSIGNED
    },
    pm25raw: {
      type: Sequelize.FLOAT.UNSIGNED
    },
    temp: {
      type: Sequelize.FLOAT()
    },
    humidity: {
      type: Sequelize.FLOAT().UNSIGNED
    }
  },{underscored: true});

  return Sample;
};
