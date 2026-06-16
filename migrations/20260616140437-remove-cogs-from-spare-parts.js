"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Spare_Parts", "cogs");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Spare_Parts", "cogs", {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });
  },
};