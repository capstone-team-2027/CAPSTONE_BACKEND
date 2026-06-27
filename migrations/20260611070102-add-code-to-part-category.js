'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Part_Categories',
      'code',
      {
        type: Sequelize.STRING(10),
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'Part_Categories',
      'code'
    );
  }
};