'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Service_Combo_Catalogs', {
      combo_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Service_Combos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      catalog_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Service_Catalogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pricing_rule_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Pricing_Rules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Thêm chỉ mục unique cho cặp (combo_id, catalog_id) để tối ưu hóa truy vấn tìm kiếm
    await queryInterface.addIndex('Service_Combo_Catalogs', ['combo_id', 'catalog_id'], {
      unique: true,
      name: 'service_combo_catalogs_combo_catalog_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Service_Combo_Catalogs');
  }
};
