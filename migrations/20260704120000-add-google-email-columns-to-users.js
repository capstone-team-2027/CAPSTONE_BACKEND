'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (!table.googleId) {
      await queryInterface.addColumn('Users', 'googleId', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }

    if (!table.email) {
      await queryInterface.addColumn('Users', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (table.phoneNumber?.allowNull === false) {
      await queryInterface.changeColumn('Users', 'phoneNumber', {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      });
    }

    if (table.password?.allowNull === false) {
      await queryInterface.changeColumn('Users', 'password', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (table.googleId) {
      await queryInterface.removeColumn('Users', 'googleId');
    }

    if (table.email) {
      await queryInterface.removeColumn('Users', 'email');
    }

    if (table.phoneNumber?.allowNull === true) {
      await queryInterface.changeColumn('Users', 'phoneNumber', {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      });
    }

    if (table.password?.allowNull === true) {
      await queryInterface.changeColumn('Users', 'password', {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
    }
  },
};
