"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Spare_Parts");

    if (!table.brand) {
      await queryInterface.addColumn("Spare_Parts", "brand", {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Spare_Parts");

    if (table.brand) {
      await queryInterface.removeColumn("Spare_Parts", "brand");
    }
  },
};
