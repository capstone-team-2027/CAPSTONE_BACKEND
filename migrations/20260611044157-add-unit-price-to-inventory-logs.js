'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Inventory_Logs', 'unit_price', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Inventory_Logs', 'unit_price');
  }
};