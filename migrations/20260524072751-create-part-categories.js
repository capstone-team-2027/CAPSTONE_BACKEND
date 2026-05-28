'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Part_Categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      //Trường này được tạo ra để phục vụ bài toán Danh mục đa cấp (Cha - Con).
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Part_Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      pricing_rule_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Pricing_Rules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.Now
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.Now
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Part_Categories');
  }
};