'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Tasks', {
      fields: ['quotation_item_id'],
      type: 'foreign key',
      name: 'Tasks_quotation_item_id_fkey',
      references: {
        table: 'Quotation_Details',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Tasks', 'Tasks_quotation_item_id_fkey');
  },
};
