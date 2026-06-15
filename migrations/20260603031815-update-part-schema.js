'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // thêm cột is_active vừa thêm vào model
    await queryInterface.addColumn('Part_Categories', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    // bỏ các cột không dùng nữa
    await queryInterface.removeColumn('Part_Categories', 'parent_id');
    await queryInterface.removeColumn('Part_Categories', 'pricing_rule_id');

    // bỏ bảng Part_Catalog
    await queryInterface.dropTable('Part_Catalogs');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Part_Categories', 'is_active');
    await queryInterface.addColumn('Part_Categories', 'parent_id', {
      type: Sequelize.INTEGER, allowNull: true
    });
    await queryInterface.addColumn('Part_Categories', 'pricing_rule_id', {
      type: Sequelize.INTEGER, allowNull: true
    });
  }
};