"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Spare_Parts", "warranty_type");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Spare_Parts", "warranty_type", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
  },
};