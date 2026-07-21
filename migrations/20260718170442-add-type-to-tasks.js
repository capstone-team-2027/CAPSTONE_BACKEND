'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tasks', 'type', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'INSPECTION',
    });

    await queryInterface.sequelize.query(`
      UPDATE "Tasks"
      SET "type" = 'REPAIR'
      WHERE quotation_item_id IS NOT NULL
         OR service_catalog_id IS NOT NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Tasks', 'type');
  },
};
