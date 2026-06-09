'use strict';

const { tr } = require("zod/v4/locales");

module.exports = {
  async up(queryInterface, Sequelize) {
    // thêm cột is_active vừa thêm vào model
    await queryInterface.addColumn('Part_Categories', 'pricing_rule_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
  },
  async down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Part_Categories', 'pricing_rule_id');
  }
};