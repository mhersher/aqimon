module.exports = (sequelize, Sequelize) => {
  var Notification = sequelize.define('notification', {
    id: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    subscription_id: {
      type: Sequelize.INTEGER(5).UNSIGNED,
      foreignKey: {
        allowNull: false
      }
    },
    sample_id: {
      type: Sequelize.INTEGER.UNSIGNED,
      foreignKey: {
        allowNull: false
      }
    }
  },{underscored: true});

  return Notification;
};
