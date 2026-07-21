'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Quotation_Details', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'PENDING',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Quotation_Details', 'status');
  },
};
