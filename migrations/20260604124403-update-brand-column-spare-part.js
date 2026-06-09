'use strict';

const { tr } = require("zod/v4/locales");

module.exports = {
  async up(queryInterface, Sequelize) {
    // thêm cột is_active vừa thêm vào model
    await queryInterface.addColumn('Spare_Parts', 'brand', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    
  },
  async down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Spare_Parts', 'brand');
  }


  
};