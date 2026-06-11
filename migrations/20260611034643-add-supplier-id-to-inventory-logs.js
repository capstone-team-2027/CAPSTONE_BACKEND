'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Inventory_Logs', 'supplier_id', {
      type: Sequelize.INTEGER,
      allowNull: true, 
      references: {
        model: 'Suppliers', 
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Inventory_Logs', 'supplier_id');
  }
};