'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Inventory_Logs', 'Inventory_Logs_service_order_id_fkey');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Inventory_Logs', {
      fields: ['service_order_id'],
      type: 'foreign key',
      name: 'Inventory_Logs_service_order_id_fkey',
      references: {
        table: 'Service_Orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};
