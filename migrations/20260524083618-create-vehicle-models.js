'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicle_Models', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      make_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // FIX: Bắt buộc dòng xe phải thuộc một hãng xe nào đó
        references: {     // FIX: Thiết lập khóa ngoại liên kết sang bảng Vehicle_Makes
          model: 'Vehicle_Makes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Chặn xóa Hãng xe nếu đang có các Dòng xe con thuộc hãng đó
      },
      model_name: {
        type: Sequelize.STRING(50),
        allowNull: false // FIX: Tên dòng xe bắt buộc phải nhập (Vd: Vios, Civic)
      },
      vehicle_type: {
        type: Sequelize.STRING(50),
        allowNull: false // FIX: Kiểu dáng bắt buộc phải nhập (Vd: Sedan, SUV)
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
    await queryInterface.addIndex('Vehicle_Models', ['make_id']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vehicle_Models');
  }
};