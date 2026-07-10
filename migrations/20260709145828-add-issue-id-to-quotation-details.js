'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Quotation_Details', 'issue_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Vehicle_Issues',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Quotation_Details', 'issue_id');
  },
};
