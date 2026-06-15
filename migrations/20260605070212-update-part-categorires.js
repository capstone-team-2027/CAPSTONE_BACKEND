'use strict';

const { tr } = require("zod/v4/locales");

module.exports = {
  async up(queryInterface, Sequelize) {
    // thêm cột is_active vừa thêm vào model
    await queryInterface.addColumn('Part_Categories', 'description', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    
  },
  async down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Part_Categories', 'description');
  }
};