'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Spare_Parts', 'image_url');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Spare_Parts', 'image_url', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  }
};