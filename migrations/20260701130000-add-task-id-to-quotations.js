'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Quotations', 'task_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('Quotations', {
      fields: ['task_id'],
      type: 'foreign key',
      name: 'Quotations_task_id_fkey',
      references: {
        table: 'Tasks',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Quotations', 'Quotations_task_id_fkey');
    await queryInterface.removeColumn('Quotations', 'task_id');
  },
};
