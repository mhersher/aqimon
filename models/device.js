module.exports = (sequelize, Sequelize) => {
  var Device = sequelize.define('device', {
    id: {
      type: Sequelize.INTEGER(5).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    indoor: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    lat: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    lng: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    state: {
      type: Sequelize.STRING(2),
      allowNull: false
    },
    nearest_purpleair: {
      type: Sequelize.STRING(30)
    }
  },{underscored: true});

  return Device;
};
