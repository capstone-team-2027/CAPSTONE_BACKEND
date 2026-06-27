'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Quotations', 'Quotations_service_order_id_fkey');
    await queryInterface.changeColumn('Quotations', 'service_order_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Quotations', 'service_order_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Service_Orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
