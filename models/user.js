module.exports = (sequelize, Sequelize) => {
  var User = sequelize.define('user', {
    email: {
      type: Sequelize.STRING(),
      primaryKey: true,
      allowNull: false
    },
    first_name: {
      type: Sequelize.STRING(),
      allowNull: false
    },
    last_name: {
      type: Sequelize.STRING(),
      allowNull: false
    },
    phone_country_code: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    phone_phone_number: {
      type: Sequelize.STRING(10),
      allowNull: false
    },
    units: {
      type: Sequelize.STRING(2),
      allowNull: false
    }
  },{underscored: true});

  return User;
};
